export function calculateGradePoint(letterGrade, creditHour) {
    const gradePointScale = {
        A: 4.0,
        'B+': 3.5,
        B: 3.0,
        'C+': 2.5,
        C: 2.0,
        'D+': 1.5,
        D: 1.0,
        F: 0.0,
    };
    return creditHour * gradePointScale[letterGrade]
}

export function calculateTotalProgress(data) {
    let courses = 0
    let creditHours = 0
    if (data) {
        for (const year of data)
            for (const sem of year)
                for (const course of sem?.courses)
                    if (sem?.courses?.length !== 0) {
                        courses += 1
                        creditHours += (course?.course?.creditHours ?? 3)
                    }
    }
    return { courses, creditHours }
}

export function calculateCompletedProgress(data) {
    let coursesDone = 0
    let creditHoursDone = 0
    let totalGradePoint = 0

    if (data) {
        for (const sem of data) {
            creditHoursDone += (sem?.termCourse?.course?.creditHours ?? 3)
            coursesDone += 1
            totalGradePoint += calculateGradePoint(sem?.grade, (sem?.termCourse?.course?.creditHours ?? 3))
        }
    }
    const gpa = (totalGradePoint / creditHoursDone)
    return { coursesDone, creditHoursDone, gpa: (isNaN(gpa) ? 0 : gpa) }
}