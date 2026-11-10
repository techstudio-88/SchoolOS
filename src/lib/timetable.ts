type Slot = Record<string, unknown>;

function text(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  return aStart < bEnd && bStart < aEnd;
}

export function findTimetableConflict(
  candidate: Slot,
  existing: Array<{ id: number; payload: Slot }>,
  excludeId?: number,
) {
  const day = text(candidate.day);
  if (!day) return null;
  const period = text(candidate.period);
  const start = text(candidate.startTime);
  const end = text(candidate.endTime);
  const teacher = text(candidate.teacher);
  const room = text(candidate.room);
  const grade = text(candidate.class);
  const section = text(candidate.section);

  for (const row of existing) {
    if (row.id === excludeId) continue;
    const other = row.payload ?? {};
    if (text(other.day) !== day) continue;
    const samePeriod = period && text(other.period) === period;
    const sameTime = overlaps(start, end, text(other.startTime), text(other.endTime));
    if (!samePeriod && !sameTime) continue;

    if (grade && text(other.class) === grade && section === text(other.section)) {
      return { type: "class", message: "This class already has a lesson in that period or time slot." };
    }
    if (teacher && text(other.teacher) === teacher) {
      return { type: "teacher", message: "This teacher is already assigned to another class in that period or time slot." };
    }
    if (room && text(other.room) === room) {
      return { type: "room", message: "This room is already booked in that period or time slot." };
    }
  }
  return null;
}
