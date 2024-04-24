const { PrismaClient } = require('@prisma/client');
const { csvToObjects } = require('./util')

const prisma = new PrismaClient()

async function seedCourseData(departments) {
    // TODO: Deal with course packages - https://stackoverflow.com/questions/7695997/split-the-sentences-by-and-remove-surrounding-spaces

    /*
    Excel steps to get course term availability

    1. Create new column TERM_2 using the last 2 digits of TERM column - `RIGHT(A2, 2))`. 10 = Fall, 20 = Spring
    2. Remove duplicates with both COUSE_NUMB and TERM_2 as dependencies
    3. COURSE_NUMB is Col 2 and TERM_2 is Col 3.
    4. Create new column AVAILABILITY
    5. Use formula: `=IF(AND(COUNTIFS(B:B,B2,C:C,"10")>0,COUNTIFS(B:B,B2,C:C,"20")>0),"F,S",IF(COUNTIFS(B:B,B2,C:C,"10")>0,"F","S"))`
    6. Copy and paste the values in the col calculated above to make values permanent.
    7. Remove duplicates with COUSE_NUMB, SCHEDULE_TYPE as dependency

    With new data, use schedule file to create the availability excel using above formulas
    then link to course data excel using `=IFERROR(VLOOKUP(SUBSTITUTE(A2," ",""),'[Course Availability.xlsx]Sheet1'!$A:$B,2,FALSE),"")`

    Some courses have duplicate entries in main data. the course code can be same but may have more than 1 space in between the letters & numbers. So it's best to use Excel to remove all spaces between course codes (using SUBSTITUTE) and then remove duplicates.
    */

    /*
    Excel steps to get linked lab boolean - unused for now
    1. Remove duplicates with COUSE_NUMB, SCHEDULE_TYPE as dependency
    2. Create new column LINKED_LAB
    3. Use formula: `=IF(AND(COUNTIFS(A:A,A2,B:B,"LB",C:C,0)>0,C2<>0),1,0)` A - COURSE_NUMB, B - SCHEDULE_TYPE, C - CREDIT_HRS
    4. Copy and paste the values in the col calculated above to make values permanent.
    */

    console.log("Seeding course data...");

    const courseData = await csvToObjects("./data/courses.csv")

    const createCourseData = []

    for (const row of courseData) {
        if (!departments[row.dept]) {
            // Add missing departments/colleges to DB
            departments[row.dept] = await prisma.department.create({
                data: {
                    name: row.dept,
                    college: {
                        connectOrCreate: {
                            create: { name: row.college },
                            where: { name: row.college }
                        }
                    }
                }
            })
        }

        let creditHours = parseInt(row.bill_hr_low)
        if (creditHours == 0) {
            if (row.bill_hr_high)
                creditHours = parseInt(row.bill_hr_high)
        }

        const data = {
            code: row.course_no.replace(/\s/g, ''),
            title: row.course_title,
            description: row.description,
            type: row.schedule_type,
            level: row.level.slice(1, 3),
            linkedLab: false,
            creditHours,
            availableTerms: row.availability ? row.availability : 'F,S',
            preRequisites: row.pre_req.trim(),
            gradeMode: row.grade_mode[1], // first letter after the opening bracket
            departmentId: departments[row.dept].id,
            collegeId: departments[row.dept].collegeId
        }

        const schedule_type = row.schedule_type.split(',').map(item => item.trim().slice(0, 2)).filter((item) => item !== "")

        if (schedule_type.length == 1) {
            // if (schedule_type[0] == "LL") {
            //     const tempData = { ...data }
            //     tempData.type = "LC"
            //     createCourseData.push(tempData)
            // }
            data.type = schedule_type[0]
        }
        else {
            if (schedule_type.includes('LB') && schedule_type.includes('LC')) {
                data.linkedLab = true
                const linkedLabData = { ...data }
                linkedLabData.type = 'LB'
                linkedLabData.creditHours = 0

                createCourseData.push(linkedLabData)

                data.type = 'LC'
            }
            else if (schedule_type.includes('SP'))
                data.type = 'SP'
            else {
                const scheduleTypeLength = schedule_type.length
                for (let i = 0; i < scheduleTypeLength; i++) {
                    const tempData = { ...data }
                    tempData.type = schedule_type[i]
                    if (i != scheduleTypeLength - 1) createCourseData.push(tempData)
                    else data.type = schedule_type[i]
                }
            }
        }
        createCourseData.push(data)
    }
    // DEBUG CODE
    // const duplicates = createCourseData.reduce((acc, obj, index) => {
    //     const duplicateIndex = createCourseData.findIndex(
    //         (item, i) => i !== index && item.code === obj.code && item.type === obj.type
    //     );
    //     if (duplicateIndex !== -1 && !acc.some((item) => item.index === duplicateIndex)) {
    //         acc.push({ index: duplicateIndex, duplicates: [index, duplicateIndex] });
    //     }
    //     return acc;
    // }, []);
    // console.log(`\nDUPLICATES\n------------------------`);
    // for (const dup of duplicates)
    //     console.log(`${createCourseData[dup.index].code} - ${createCourseData[dup.index].type}`);

    await prisma.course.createMany({ data: createCourseData })
}

async function seedCollegeData() {
    console.log("Seeding college data...");

    const collegeData = await csvToObjects("./data/colleges.csv")

    const createCollegeData = []

    for (const row of collegeData) createCollegeData.push({ name: row.college })

    await prisma.college.createMany({ data: createCollegeData })
}

async function seedDepartmentData(colleges) {
    console.log("Seeding department data...");

    const departmentData = await csvToObjects("./data/departments.csv")

    const createDepartmentData = []

    for (const row of departmentData)
        createDepartmentData.push({ name: row.department, collegeId: colleges[row.college] })

    await prisma.department.createMany({ data: createDepartmentData })
}

async function seedMajorData(colleges) {
    console.log("Seeding major data...");

    const majorData = await csvToObjects("./data/majors.csv")

    const createMajorData = []
    const createPackageData = []

    for (const row of majorData) {
        createMajorData.push({
            name: row.major,
            code: row.major_code,
            collegeId: colleges[row.college]
        })

        // For each major add an electives package.
        createPackageData.push({ name: `${row.major} Major Electives`, majorId: 1 })
    }

    await prisma.major.createMany({ data: createMajorData })
    await prisma.package.createMany({ data: createPackageData })
}

async function seedMajorElectiveData(packages, courses) {
    console.log("Seeding major elective data...");

    let majors = await prisma.major.findMany({})
    majors = majors.reduce((acc, curr) => {
        acc[curr.code] = curr;
        return acc;
    }, {});

    const majorElectiveData = await csvToObjects("./data/major_electives.csv")

    const createMajorElectiveData = []

    for (const row of majorElectiveData) {
        if (row.electives) {
            const major = majors[row.major_code]
            if (!major) {
                console.log(`${row.major_code} major not found.`)
                continue
            }

            const packageId = packages[`${major.name} Major Electives`]
            if (!packageId) {
                console.log(`${row.major_code} major not found.`)
                continue
            }

            const electiveList = row.electives.split(",").map(e => e.trim())
            for (const electiveCourse of electiveList) {
                const dbCourseList = courses[electiveCourse]
                if (!dbCourseList) {
                    console.log(`${electiveCourse} - ${row.major_code} elective course not found.`)
                    continue
                }
                let course = dbCourseList[0]
                if (dbCourseList.length > 1) {
                    const lectureCourse = dbCourseList.find(c => c.type == "LC")
                    if (lectureCourse) course = lectureCourse
                }
                createMajorElectiveData.push({ packageId, courseId: course.id })
            }
        }
    }
    await prisma.packageCourse.createMany({ data: createMajorElectiveData })
}

async function seedPackageData(majors, courses) {
    console.log("Seeding package data...");

    const packageData = await csvToObjects("./data/packages.csv")

    const createPackageCourseData = []

    for (const row of packageData) {
        const majorId = majors[row.major]
        const createdPackage = await prisma.package.create({ data: { name: titleCase(row.package), majorId } })

        const courseList = row.courses.split(",").map(e => e.trim())

        for (const packageCourse of courseList) {
            const dbCourseList = courses[packageCourse]
            if (!dbCourseList) {
                console.log(`${packageCourse} - ${row.package} course not found.`)
                continue
            }
            let course = dbCourseList[0]
            if (dbCourseList.length > 1) {
                const lectureCourse = dbCourseList.find(c => c.type == "LC")
                if (lectureCourse) course = lectureCourse
            }
            createPackageCourseData.push({ packageId: createdPackage.id, courseId: course.id })
        }
    }

    await prisma.packageCourse.createMany({ data: createPackageCourseData })
}

async function seedSemesterData(semData) {
    console.log("Seeding semester/term data...");
    await prisma.semester.createMany({ data: semData })
}

async function seedTermData(semData) {
    // Term List for years 2019 - 2022 (available data is for these terms)
    const termData = []
    for (let year = 2019; year <= 2022; year++) {
        semData.forEach(sem => {
            termData.push({ id: parseInt(`${year}${sem.id}`), year, semesterId: sem.id })
        });
    }
    await prisma.term.createMany({ data: termData })
}

async function seedDegreePlanData(courses, electivePackages, packages, semesters) {
    console.log("Seeding degree plan data...");

    const majors = await prisma.major.findMany({})
    for (const major of majors) {
        try {
            const planData = await csvToObjects(`./data/degree_plans/${major.code}.csv`)
            const planCreateData = []

            for (const row of planData) {
                const year = parseInt(row.year)
                const semesterId = semesters[row.semester]

                let planCreateObj

                let packageId
                if (row.course.length > 8) {
                    // It's a package/elective since course codes have max length of 8
                    if (row.course.toLowerCase().includes("major elective")) {
                        row.course = `${major.name} Major Electives`
                        packageId = electivePackages[row.course]
                    }
                    else {
                        packageId = packages[`${major.id}${titleCase(row.course)}`]
                    }

                    if (!packageId) {
                        console.log(`${row.course} not found`);
                    }

                    planCreateObj = {
                        majorId: major.id,
                        packageId, year, semesterId
                    }
                }
                else {
                    // It's a normal course
                    const dbCourseList = courses[row.course]
                    if (!dbCourseList) console.log(`${major.code}: ${row.course} course not found`);

                    let courseId = dbCourseList[0].id
                    if (dbCourseList.length > 1) {
                        const lectureCourse = dbCourseList.find(c => c.type == "LC")
                        if (lectureCourse) courseId = lectureCourse.id
                    }

                    planCreateObj = {
                        majorId: major.id,
                        courseId, year, semesterId
                    }
                }
                planCreateData.push(planCreateObj)
            }
            await prisma.degreePlan.createMany({ data: planCreateData })
        } catch (e) {
            if (e.code != "ENOENT") {
                // skip file not found errors
                console.log(e)
                console.log("Failed to load degree plan data for " + major.name)
            }
        }
    }
}

async function seedInstructorData() {
    console.log("Seeding instructor data...");

    const instructorData = await csvToObjects("./data/instructors.csv")

    instructorData.forEach(inst => inst.id = parseInt(inst.id))

    await prisma.instructor.createMany({ data: instructorData })
}

async function seedScheduleData(courses) {
    console.log("Seeding semester schedule data...");

    const termCourseData = await csvToObjects("./data/semester_schedule.csv")
    // Schedule data provided has duplicate combinations of [CRN, CourseID] to indicate:
    // TA's for each section and Different timings on different days
    // Since TA's aren't useful info for us, use Excel to filter and keep only sections with PRIMARY_IND as Y

    const createTermCoursesData = []
    const tempLogs = {}
    for (const courseSection of termCourseData) {
        let dbCourse = courses[courseSection.course_no]
        const temp = dbCourse
        // If course doesn't exist in DB, skip 
        // avoids masters and other level courses we're not working with during this project
        if (!dbCourse) continue
        else dbCourse = dbCourse.find(c => c.type == courseSection.schedule_type)

        if (!dbCourse) {
            // TODO: Handle missing course types due to catalog not having them
            // Example - ELEC428 - LL not found; Available: LB, , LC,

            // const x = `${courseSection.course_no}-${courseSection.schedule_type}`
            // if (!tempLogs[x]) {
            //     tempLogs[x] = {}
            //     console.log(`Missing: ${x}\tAvailable: ${temp.map(t => t.type)}`);
            // }

            continue
        }

        const data = {
            crn: parseInt(courseSection.crn),
            termId: parseInt(courseSection.term),
            instructorId: parseInt(courseSection.ins_id),
            courseId: dbCourse.id,
            sectionNo: courseSection.section_no,
            campus: courseSection.campus,
            instructionalMethod: courseSection.instructional_method,
            seatsTotal: parseInt(courseSection.max_enrollment),
            seatsCurrent: parseInt(courseSection.current_enrollment),
            waitlistTotal: parseInt(courseSection.wait_cap),
            waitlistCurrent: parseInt(courseSection.wait_curr),
            meetingDays: courseSection.meeting_times,
            meetingTimeStart: courseSection.begin_time,
            meetingTimeEnd: courseSection.end_time,
            room: courseSection.room_no
        }
        createTermCoursesData.push(data)
    }
    // workaround the timeout issue when doing createMany with more than 4k rows
    const batchSize = 4000
    const totalItems = createTermCoursesData.length
    let startIndex = 0

    while (startIndex < totalItems) {
        const endIndex = Math.min(startIndex + batchSize, totalItems)
        const batchData = createTermCoursesData.slice(startIndex, endIndex)
        await prisma.termCourse.createMany({ data: batchData })
        startIndex += batchSize
    }
}

async function seedStudentData(courses, termCourses, colleges, majors) {
    console.log("Seeding student data...");
    // Provided student grade data is incomplete and missing several values
    // We will use only one student's grades to demonstrate the project functionality

    const userData = {
        id: 201908619,
        password: "$2a$10$kndKjPrpblqkwFevzxckTOHzlhxkE0v8Ha8RmT9FH4EuCNOd4HpWm",
        name: "Hani Jafer",
        gender: "M",
        joinYear: 2020,
        collegeId: colleges["Engineering"],
        majorId: majors["CMSC"]
    }

    await prisma.user.create({ data: userData })

    const gradeData = await csvToObjects("./data/student_grades.csv") // File has grades for 201908619 only

    const createGradeData = []
    for (const row of gradeData) {
        const dbCourseList = courses[row.course]
        if (!dbCourseList) continue

        let courseId = dbCourseList[0].id
        if (dbCourseList.length > 1) {
            const lectureCourse = dbCourseList.find(c => c.type == "LC")
            if (lectureCourse) courseId = lectureCourse.id
        }

        // Get first section in sem for each course
        let termCourseId = 0
        try {
            termCourseId = termCourses[courseId][row.term][userData.gender][0].id
        }
        catch {
            console.log(`Failed to find term course for courseId ${courseId}`);
        }

        if (!termCourseId) continue

        const studentGradeObj = {
            userId: userData.id,
            termCourseId: termCourseId,
            grade: row.grade
        }

        createGradeData.push(studentGradeObj)
    }
    await prisma.userGrade.createMany({ data: createGradeData })
}

function titleCase(string) {
    var sentence = string.toLowerCase().split(" ");
    for (var i = 0; i < sentence.length; i++) {
        sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
    }

    return sentence.join(" ");
}

async function main() {
    try {
        await seedCollegeData()

        let colleges = await prisma.college.findMany({})
        colleges = colleges.reduce((acc, curr) => {
            acc[curr.name] = curr.id
            return acc;
        }, {});

        await seedDepartmentData(colleges)

        let departments = await prisma.department.findMany({})
        departments = departments.reduce((acc, curr) => {
            acc[curr.name] = { id: curr.id, collegeId: curr.collegeId };
            return acc;
        }, {});

        await seedCourseData(departments)

        let courses = await prisma.course.findMany({})
        courses = courses.reduce((acc, curr) => {
            if (acc[curr.code]) acc[curr.code].push(curr)
            else acc[curr.code] = [curr];
            return acc;
        }, {});

        await seedMajorData(colleges)

        let majors = await prisma.major.findMany({})
        majors = majors.reduce((acc, curr) => {
            acc[curr.code] = curr.id;
            return acc;
        }, {});

        let electivePackages = await prisma.package.findMany({})
        electivePackages = electivePackages.reduce((acc, curr) => {
            acc[curr.name] = curr.id;
            return acc;
        }, {});

        await seedMajorElectiveData(electivePackages, courses)
        await seedPackageData(majors, courses)

        let packages = await prisma.package.findMany({})
        packages = packages.reduce((acc, curr) => {
            acc[`${curr.majorId}${curr.name}`] = curr.id;
            return acc;
        }, {});

        let semData = [
            { id: 10, name: "Fall", main: true },
            { id: 20, name: "Spring", main: true },
            { id: 30, name: "Summer", main: false },
            { id: 40, name: "Winter", main: false }
        ]
        await seedSemesterData(semData)

        semesters = semData.reduce((acc, curr) => {
            acc[curr.name] = curr.id;
            return acc;
        }, {});

        await seedTermData(semData)
        await seedDegreePlanData(courses, electivePackages, packages, semesters)
        await seedInstructorData()
        await seedScheduleData(courses)

        let termCourses = await prisma.termCourse.findMany({ include: { course: true } })
        termCourses = termCourses.reduce((acc, curr) => {
            const course = acc[curr.courseId]
            if (course) {
                const courseTerm = course[curr.termId]
                if (courseTerm) {
                    const courseTermCampus = courseTerm[curr.campus]
                    if (courseTermCampus) courseTermCampus.push(curr)
                    else courseTerm[curr.campus] = [curr]
                }
                else {
                    course[curr.termId] = { [curr.campus]: [curr] }
                }
            }
            else {
                acc[curr.courseId] = { [curr.termId]: { [curr.campus]: [curr] } }
            }
            return acc;
        }, {});

        await seedStudentData(courses, termCourses, colleges, majors)
    } catch (e) {
        console.log(e);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })