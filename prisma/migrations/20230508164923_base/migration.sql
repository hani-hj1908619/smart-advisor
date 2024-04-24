-- CreateTable
CREATE TABLE `College` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `College_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `collegeId` INTEGER NOT NULL,

    UNIQUE INDEX `Department_name_key`(`name`),
    INDEX `Department_collegeId_idx`(`collegeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Major` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(4) NOT NULL,
    `collegeId` INTEGER NOT NULL,

    UNIQUE INDEX `Major_name_key`(`name`),
    UNIQUE INDEX `Major_code_key`(`code`),
    INDEX `Major_collegeId_idx`(`collegeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Course` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(8) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(3000) NOT NULL,
    `type` VARCHAR(2) NOT NULL,
    `level` VARCHAR(2) NOT NULL,
    `linkedLab` BOOLEAN NOT NULL,
    `creditHours` INTEGER NOT NULL,
    `preRequisites` VARCHAR(500) NULL,
    `availableTerms` VARCHAR(20) NULL,
    `gradeMode` VARCHAR(1) NULL,
    `departmentId` INTEGER NULL,
    `collegeId` INTEGER NOT NULL,

    INDEX `Course_departmentId_idx`(`departmentId`),
    INDEX `Course_collegeId_idx`(`collegeId`),
    UNIQUE INDEX `Course_code_type_key`(`code`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Package` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `Package_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageCourse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `packageId` INTEGER NOT NULL,
    `courseId` INTEGER NOT NULL,

    INDEX `PackageCourse_packageId_idx`(`packageId`),
    INDEX `PackageCourse_courseId_idx`(`courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Semester` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `main` BOOLEAN NOT NULL,

    UNIQUE INDEX `Semester_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DegreePlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `majorId` INTEGER NOT NULL,
    `courseId` INTEGER NULL,
    `packageId` INTEGER NULL,
    `year` INTEGER NOT NULL,
    `semesterId` INTEGER NOT NULL,

    INDEX `DegreePlan_packageId_idx`(`packageId`),
    INDEX `DegreePlan_courseId_idx`(`courseId`),
    INDEX `DegreePlan_majorId_idx`(`majorId`),
    INDEX `DegreePlan_semesterId_idx`(`semesterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `gender` CHAR(255) NOT NULL,
    `joinYear` INTEGER NOT NULL,
    `collegeId` INTEGER NOT NULL,
    `majorId` INTEGER NULL,

    INDEX `User_collegeId_idx`(`collegeId`),
    INDEX `User_majorId_idx`(`majorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserGrade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `termCourseId` INTEGER NOT NULL,
    `grade` VARCHAR(2) NOT NULL,

    INDEX `UserGrade_userId_idx`(`userId`),
    INDEX `UserGrade_termCourseId_idx`(`termCourseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `userId` INTEGER NOT NULL,
    `majorId` INTEGER NOT NULL,
    `startSemesterId` INTEGER NOT NULL,
    `mainPlan` BOOLEAN NOT NULL,

    INDEX `UserPlan_majorId_idx`(`majorId`),
    INDEX `UserPlan_startSemesterId_idx`(`startSemesterId`),
    INDEX `UserPlan_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPlanCourse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `planId` INTEGER NULL,
    `courseId` INTEGER NULL,
    `packageId` INTEGER NULL,
    `year` INTEGER NOT NULL,
    `semesterId` INTEGER NOT NULL,
    `planRequiredCourse` BOOLEAN NOT NULL,

    INDEX `UserPlanCourse_packageId_idx`(`packageId`),
    INDEX `UserPlanCourse_courseId_idx`(`courseId`),
    INDEX `UserPlanCourse_semesterId_idx`(`semesterId`),
    INDEX `UserPlanCourse_planId_idx`(`planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reviewDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `instructorId` INTEGER NULL,
    `courseId` INTEGER NULL,
    `material` DOUBLE NULL,
    `difficulty` DOUBLE NULL,
    `courseLoad` DOUBLE NULL,
    `teaching` DOUBLE NULL,
    `grading` DOUBLE NULL,
    `overall` DOUBLE NULL,

    INDEX `Review_userId_idx`(`userId`),
    INDEX `Review_instructorId_idx`(`instructorId`),
    INDEX `Review_courseId_idx`(`courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Instructor` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Term` (
    `id` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `semesterId` INTEGER NOT NULL,

    INDEX `Term_semesterId_idx`(`semesterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TermCourse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `crn` INTEGER NOT NULL,
    `termId` INTEGER NOT NULL,
    `courseId` INTEGER NOT NULL,
    `instructorId` INTEGER NULL,
    `sectionNo` CHAR(5) NOT NULL,
    `campus` CHAR(1) NOT NULL,
    `instructionalMethod` VARCHAR(255) NOT NULL,
    `seatsTotal` INTEGER NOT NULL,
    `seatsCurrent` INTEGER NOT NULL,
    `waitlistTotal` INTEGER NOT NULL,
    `waitlistCurrent` INTEGER NOT NULL,
    `meetingDays` VARCHAR(255) NULL,
    `meetingTimeStart` VARCHAR(5) NULL,
    `meetingTimeEnd` VARCHAR(5) NULL,
    `room` VARCHAR(20) NULL,

    INDEX `TermCourse_termId_idx`(`termId`),
    INDEX `TermCourse_courseId_idx`(`courseId`),
    INDEX `TermCourse_instructorId_idx`(`instructorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSchedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `courseId` INTEGER NOT NULL,
    `termCourseId` INTEGER NULL,

    INDEX `UserSchedule_courseId_idx`(`courseId`),
    INDEX `UserSchedule_termCourseId_idx`(`termCourseId`),
    INDEX `UserSchedule_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CourseWatchlist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `termId` INTEGER NOT NULL,
    `courseId` INTEGER NOT NULL,

    INDEX `CourseWatchlist_termId_idx`(`termId`),
    INDEX `CourseWatchlist_userId_idx`(`userId`),
    INDEX `CourseWatchlist_courseId_idx`(`courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Todo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `completed` BOOLEAN NOT NULL,

    INDEX `Todo_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
