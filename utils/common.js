export function checkSectionConflict(section1, section2) {
    // Loop through the meeting times of section1
    for (let i = 0; i < section1.meetingTimes.length; i++) {
        const meetingTime1 = section1.meetingTimes[i];

        // Loop through the meeting times of section2
        for (let j = 0; j < section2.meetingTimes.length; j++) {
            const meetingTime2 = section2.meetingTimes[j];

            // Check if the meeting days overlap
            const daysOverlap = meetingTime1.meetingDays.split('  ').some(day => meetingTime2.meetingDays.split('  ').includes(day));

            // Check if the meeting times overlap
            const start1 = new Date(`2023-05-05T${meetingTime1.meetingTimeStart.padStart(5, '0')}:00`);
            const end1 = new Date(`2023-05-05T${meetingTime1.meetingTimeEnd.padStart(5, '0')}:00`);
            const start2 = new Date(`2023-05-05T${meetingTime2.meetingTimeStart.padStart(5, '0')}:00`);
            const end2 = new Date(`2023-05-05T${meetingTime2.meetingTimeEnd.padStart(5, '0')}:00`);
            const timesOverlap = (start1 <= end2) && (start2 <= end1);

            // If there is an overlap in both days and times, the sections conflict
            if (daysOverlap && timesOverlap) return true
        }
    }

    // If there is no overlap in any of the meeting times, the sections do not conflict
    return false;
}

export function processPrerequisites(s) {
    const groups = [];
    let depth = 0;

    function push(obj, l, depth) {
        while (depth) {
            l = l[l.length - 1];
            depth -= 1;
        }

        l.push(obj);
    }

    try {
        let currentValue = ''
        for (let i = 0; i < s.length; i++) {
            const char = s[i];
            if (char === '(') {
                push([], groups, depth);
                depth += 1;
            } else if (char === ')') {
                const temp = currentValue.trim()
                if (temp.length) push(temp, groups, depth)

                currentValue = '';
                depth -= 1;
            } else {
                if (s.slice(i, i + 2) == "OR") {
                    i = i + 2
                    const temp = currentValue.trim()
                    if (temp.length) push(temp, groups, depth)
                    currentValue = '';
                    push("OR", groups, depth);
                } else if (s.slice(i, i + 3) == "AND") {
                    i = i + 3
                    const temp = currentValue.trim()
                    if (temp.length) push(temp, groups, depth)
                    currentValue = '';
                    push("AND", groups, depth);
                } else {
                    currentValue += char
                    if (i == s.length - 1) {
                        const temp = currentValue.trim()
                        if (temp.length) push(temp, groups, depth)
                    }
                }
            }
        }
    } catch (error) {
        throw new Error('Parentheses mismatch');
    }

    if (depth > 0) {
        throw new Error('Parentheses mismatch');
    } else {
        return groups;
    }
}

export function arePrerequisitesMet(preRequisites, semIndex, yearIndex, planData) {
    let isMet = false;

    for (const prereq of preRequisites) {
        if (Array.isArray(prereq))
            isMet = arePrerequisitesMet(prereq, semIndex, yearIndex, planData)
        else if (prereq === "AND") {
            if (!isMet) return false;
            else isMet = false;
        } else if (prereq === "OR") {
            if (isMet) return true
        }
        else {
            if (prereq.includes(" ")) isMet = true; // Ignore exam scores for now
            else {
                for (let y = yearIndex; y >= 0; y--) {
                    const year = planData[y];

                    for (let s = (y === yearIndex ? semIndex - 1 : year.length - 1); s >= 0; s--) {
                        const planCourses = year[s].courses;

                        if (planCourses.some(planCourse => planCourse.course && planCourse.course.code === prereq)) {
                            isMet = true;
                            break;
                        }
                    }
                    if (isMet) break
                }
            }
        }
    }
    return isMet;
}

export function areForwardPrerequisitesNotMet(courseCode, semIndex, yearIndex, planData) {
    let isMet = true
    for (let y = yearIndex; y >= 0; y--) {
        const year = planData[y];
        //(y === yearIndex ? semIndex - 1 : year.length - 1)
        for (let s = (y === yearIndex ? semIndex : year.length - 1); s >= 0; s--) {
            const planCourses = year[s].courses;

            for (const planCourse of planCourses) {
                const preq = planCourse?.course && processPrerequisites(planCourse?.course?.preRequisites)

                if (preq && preq.some((preReq) => {
                    return preReq === courseCode
                })) {
                    // was true
                    isMet = false;
                    return false;
                }
            }
        }
    }
    return isMet;
}

export function sectionTimeCompareFn(a, b) {
    function getEarliestMeetingTime(meetingTimes) {
        return meetingTimes.reduce((earliest, current) => {
            if (!earliest) return current;

            const timeA = earliest.split(':');
            const timeB = current.split(':');

            const hourA = parseInt(timeA[0]);
            const minuteA = parseInt(timeA[1]);
            const hourB = parseInt(timeB[0]);
            const minuteB = parseInt(timeB[1]);

            if (hourB < hourA) {
                return current;
            } else if (hourA == hourB) {
                if (minuteB < minuteA) {
                    return current;
                }
            }

            return earliest;
        }, null);
    }

    const meetingTimesA = a.meetingTimes.map((time) => time.meetingTimeStart);
    const meetingTimesB = b.meetingTimes.map((time) => time.meetingTimeStart);

    const earliestTimeA = getEarliestMeetingTime(meetingTimesA).split(':');
    const earliestTimeB = getEarliestMeetingTime(meetingTimesB).split(':');

    const hourA = parseInt(earliestTimeA[0]);
    const minuteA = parseInt(earliestTimeA[1]);
    const hourB = parseInt(earliestTimeB[0]);
    const minuteB = parseInt(earliestTimeB[1]);

    if (hourA < hourB) {
        return -1;
    } else if (hourA > hourB) {
        return 1;
    } else {
        if (minuteA < minuteB) {
            return -1;
        } else if (minuteA > minuteB) {
            return 1;
        } else {
            return 0;
        }
    }
}

