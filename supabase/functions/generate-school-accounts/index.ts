import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";
const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json; charset=utf-8"};
const roles = [
 {role:"owner",label:"Owner",prefix:"OWN",count:1},
 {role:"manager",label:"Manager",prefix:"MGR",count:1},
 {role:"principal",label:"Principal",prefix:"PRN",count:1},
 {role:"vice_principal",label:"Vice Principal",prefix:"VP",count:1},
 {role:"fees_counter",label:"Fees Counter",prefix:"FEE",count:1},
 {role:"class_teacher",label:"Class Teacher",prefix:"CT",count:10},
 {role:"subject_teacher",label:"Subject Teacher",prefix:"ST",count:10}
];
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
const hex=(bytes:ArrayBuffer)=>[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,"0")).join("");
const digest=async(value:string)=>hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)));
const randomPart=(n=5)=>crypto.randomUUID().replaceAll("-","").slice(0,n).toUpperCase();
const password=()=>{const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";const bytes=crypto.getRandomValues(new Uint8Array(18));return [...bytes].map(b=>alphabet[b%alphabet.length]).join("")};
const emailFor=(userId:string)=>userId.toLowerCase().replace(/[^a-z0-9-]/g,"")+"@accounts.schoolsuite.app";
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return json({error:"Use POST."},405);
 try{
  const body=await req.json();const schoolName=String(body?.schoolName??"").trim().replace(/\s+/g," ");const adminKey=String(body?.adminKey??"");
  if(schoolName.length<2||schoolName.length>120)return json({error:"Enter a school name between 2 and 120 characters."},400);
  if(adminKey.length<20)return json({error:"Admin key is missing or invalid."},401);
  const url=Deno.env.get("SUPABASE_URL");const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!serviceKey)return json({error:"Server configuration is incomplete. Contact the app administrator."},500);
  const db=createClient(url,serviceKey,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:keyRow,error:keyError}=await db.from("admin_bootstrap_keys").select("key_hash").eq("id",true).single();
  if(keyError||!keyRow||await digest(adminKey)!==keyRow.key_hash)return json({error:"Admin key is incorrect."},401);
  const base=schoolName.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,5)||"SCHOOL";const schoolCode=base+"-"+randomPart(4);
  const {data:school,error:schoolError}=await db.from("schools").insert({name:schoolName,school_code:schoolCode}).select("id,name,school_code").single();
  if(schoolError||!school)return json({error:"Could not create school: "+(schoolError?.message??"unknown error")},500);
  const made:Array<{id:string;userId:string;password:string;role:string;displayName:string}>=[];
  try{
   for(const group of roles)for(let n=1;n<=group.count;n++){
    const userId=schoolCode+"-"+group.prefix+"-"+String(n).padStart(2,"0")+"-"+randomPart(4);const pass=password();
    const displayName=group.count===1?schoolName+" "+group.label:schoolName+" "+group.label+" "+String(n).padStart(2,"0");
    const {data:created,error:createError}=await db.auth.admin.createUser({email:emailFor(userId),password:pass,email_confirm:true,user_metadata:{display_name:displayName,user_id:userId,school_code:schoolCode}});
    if(createError||!created.user)throw new Error("Could not create "+group.label+" "+n+": "+(createError?.message??"unknown error"));
    const {error:profileError}=await db.from("profiles").upsert({id:created.user.id,user_id:userId,display_name:displayName,role:group.role,active:true,school_id:school.id},{onConflict:"id"});
    if(profileError){await db.from("profiles").delete().eq("id",created.user.id);await db.auth.admin.deleteUser(created.user.id);throw new Error("Could not create profile for "+group.label+" "+n+": "+profileError.message)}
    made.push({id:created.user.id,userId,password:pass,role:group.role,displayName});
   }
  }catch(error){
   for(const user of made.reverse()){await db.from("profiles").delete().eq("id",user.id);await db.auth.admin.deleteUser(user.id)}
   await db.from("schools").delete().eq("id",school.id);
   return json({error:error instanceof Error?error.message:"Account creation failed; no school accounts were kept."},500);
  }
  return json({school:{name:school.name,code:school.school_code},totalAccounts:made.length,note:"Passwords are returned only in this response and are not stored in the application database. Save or download this list now.",accounts:made.map(({userId,password:pass,role,displayName})=>({userId,password:pass,role,displayName}))},201);
 }catch(error){return json({error:error instanceof Error?error.message:"Unexpected server error."},500)}
});