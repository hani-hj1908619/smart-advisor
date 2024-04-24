import {
    Card,
    CardBody,
    CardHeader,
    Center,
    CircularProgress,
    CircularProgressLabel,
    Flex,
    Heading,
    Spinner,
    Text
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from "react";
import { useData } from "../../utils/commonFetch";
import { calculateCompletedProgress, calculateTotalProgress } from "../../utils/progressCommon";

export default function ProgressCard({ userId, mainPlan }) {
    const userGrades = useData(`/api/user/${userId}/grades`)
    const [progress, setProgress] = useState({
        percentage: 0,
        coursesCompleted: 0,
        creditHoursCompleted: 0,
        totalCreditHours: 0,
        totalCourses: 0,
        grade: 0
    })
    const progressRef = useRef(progress); // Store progress using useRef

    useEffect(() => {
        progressRef.current = progress; // Update progressRef when progress changes
    }, [progress]);

    useEffect(() => {
        if (mainPlan && userGrades) {
            const totalProgress = calculateTotalProgress(mainPlan)
            const completedProgress = calculateCompletedProgress(userGrades)
            setProgress({
                percentage: ((completedProgress.coursesDone / totalProgress.courses) * 100).toFixed(0),
                coursesCompleted: completedProgress.coursesDone,
                creditHoursCompleted: completedProgress.creditHoursDone,
                grade: completedProgress.gpa,
                totalCourses: totalProgress.courses,
                totalCreditHours: totalProgress.creditHours
            })
        }
    }, [userGrades])

    return (
        <Card size='md' width={'250px'} sx={{ bgColor: 'gray.50' }}>
            <CardHeader pb={2} sx={{ textAlign: 'center' }}>
                <Heading size='md'>Degree Progress</Heading>
            </CardHeader>

            <CardBody pt={2}>
                <Center flexDirection={'column'}>
                    <CircularProgress
                        value={progress.percentage ? progress.percentage : 0}
                        thickness={'16px'}
                        size={'120px'} color='green.300'
                    >
                        <CircularProgressLabel>
                            {progress.percentage ? progress.percentage : 0}%
                        </CircularProgressLabel>
                    </CircularProgress>

                    <Flex mb={2} mt={4} direction={'column'}>
                        <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.700' fontSize='md'>
                            Computer Science
                        </Text>

                        <Text fontFamily={"sans-serif"} color='blackAlpha.700' fontSize='sm'>
                            {!isNaN(progress.grade) ? progress.grade.toFixed(2) : 0} GPA
                        </Text>

                        <Text fontFamily={"sans-serif"} color='blackAlpha.700' fontSize='sm'>
                            {progress.creditHoursCompleted}/{progress.totalCreditHours} Credit Hours completed
                        </Text>

                        <Text fontFamily={"sans-serif"} color='blackAlpha.700' fontSize='sm'>
                            {progress.coursesCompleted}/{progress.totalCourses} Courses completed
                        </Text>
                    </Flex>
                </Center>
            </CardBody>
        </Card>
    )
}