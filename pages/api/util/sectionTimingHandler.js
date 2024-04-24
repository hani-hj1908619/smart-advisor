export default function sectionTimingHandler(sections) {
    // CRNs can be duplicated to represent sections having different times or rooms on different days.
    // This function removes the duplicates and adds the different timings into a timings 
    // array of a single section(TermCourse) object.

    const sectionsTimingsCombined = sections.reduce((acc, curr) => {
        const { meetingDays, meetingTimeStart, meetingTimeEnd, room, ...updatedVal } = curr

        if (acc[curr.crn]) {
            acc[curr.crn].meetingTimes.push({ meetingDays, meetingTimeStart, meetingTimeEnd, room })
        }
        else {
            updatedVal.meetingTimes = [{ meetingDays, meetingTimeStart, meetingTimeEnd, room }]
            acc[curr.crn] = updatedVal
        }

        return acc
    }, {})

    const values = Object.keys(sectionsTimingsCombined).map(function (key) {
        return sectionsTimingsCombined[key];
    })

    return values
}