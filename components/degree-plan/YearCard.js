import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Card, CardBody, CardHeader, Center, Flex, Heading, IconButton, Text, useBoolean,
} from '@chakra-ui/react';
import React, { useEffect, useState } from "react";
import { AiFillCaretDown } from "react-icons/ai";
import { MdClose, MdDelete } from "react-icons/md";
import { useStore } from "stores/store";
import { areForwardPrerequisitesNotMet, arePrerequisitesMet, processPrerequisites } from 'utils/common';

export default function YearCard({
    data,
    yearIndex,
    setSelectedPlan,
    selectedPlan,
    setSelectedPlanCourse,
    setPlanHasChanged,
    onOpenInfoModal,
    onOpenPkgModal
}) {
    const [isDropped, setIsDropped] = useState(false)
    const draggedCourse = useStore((state) => state.courseToAdd)
    const setCourseToAdd = useStore((state) => state.setCourseToAdd)
    const [yearEmpty, setYearEmpty] = useState(false)

    const [showCommonAlert, setShowCommonAlert] = useState()
    const [commonAlertHeader, setCommonAlertHeader] = useState("")
    const [commonAlertBody, setCommonAlertBody] = useState("")

    useEffect(() => {
        setYearEmpty(true)
        for (const sem of data) {
            if (sem.courses.length) {
                setYearEmpty(false)
                break
            }
        }
    }, [data])


    useEffect(() => {
        if (isDropped) {
            const dragData = JSON.parse(localStorage.getItem('dragData'))
            const updatedPlan = JSON.parse(JSON.stringify(selectedPlan))
            const droppedSem = updatedPlan.plan[dragData.yearIndex][dragData.semIndex]

            const newCourse = JSON.parse(JSON.stringify(draggedCourse)) //zustand state variable
            setCourseToAdd(null)

            let planCourse, oldSemCourseList, oldCourseIndex;
            if (draggedCourse) {
                // Add new course

                // Check if it already exists in plan
                for (const [yearIndex, year] of selectedPlan.plan.entries()) {
                    for (const sem of year) {
                        for (const planCourse of sem.courses) {
                            if (planCourse.courseId == newCourse.id) {
                                setIsDropped(false)
                                setShowCommonAlert(true)
                                setCommonAlertHeader("Duplicate Course")
                                setCommonAlertBody(`${newCourse.code} - ${newCourse.title} exists already in Year ${yearIndex + 1} - ${sem.name} semester!`)
                                return
                            }
                        }
                    }
                }

                planCourse = {
                    year: parseInt(dragData.yearIndex) + 1,
                    semesterId: droppedSem.id,
                    courseId: newCourse.id,
                    course: newCourse
                }
            } else if (dragData.draggedCourseId || dragData.draggedPackageId) {
                // If dragged and dropped into same sem, do nothing
                if (dragData.yearIndex == dragData.draggedCourseYearIndex &&
                    dragData.semIndex == dragData.draggedCourseSemIndex) {
                    setIsDropped(false)
                    return
                }

                // Get dragged course from old semester
                oldSemCourseList = updatedPlan.plan[dragData.draggedCourseYearIndex][dragData.draggedCourseSemIndex].courses
                oldCourseIndex = oldSemCourseList.findIndex(planCourse =>
                    parseInt(dragData.draggedCourseId) ?
                        planCourse.courseId == dragData.draggedCourseId
                        : (!planCourse.courseId && planCourse.packageId == dragData.draggedPackageId)
                )
                planCourse = oldSemCourseList[oldCourseIndex]
            }

            let availabilityMet = true
            //Check availability of course in semester
            if (planCourse.course) {
                const availableTerms = planCourse.course.availableTerms.split(',').map(term => {
                    if (term == 'F') return "Fall"; else if (term == 'S') return "Spring"
                });
                availabilityMet = availableTerms.includes(droppedSem.name)
            }
            if (!availabilityMet) {
                setShowCommonAlert(true)
                setCommonAlertHeader("Course Not Available")
                setCommonAlertBody(`${planCourse.course.code} - ${planCourse.course.title} is not offered in the ${droppedSem.name} semester!`)
            } else {
                // Check pre requisites
                let preReqsMet = true
                let postReqsMet = true
                if (planCourse.course) {
                    const preReqs = planCourse.course.preRequisites
                    if (preReqs.length) {
                        preReqsMet = false

                        const prerequisite_groups = processPrerequisites(preReqs)
                        preReqsMet = arePrerequisitesMet(prerequisite_groups, dragData.semIndex, dragData.yearIndex, selectedPlan.plan)
                    }
                    postReqsMet = areForwardPrerequisitesNotMet(planCourse.course.code, dragData.semIndex, dragData.yearIndex, selectedPlan.plan)
                }

                if (!preReqsMet) {
                    setShowCommonAlert(true)
                    setCommonAlertHeader("Missing Pre-Requisites")
                    setCommonAlertBody(`You will not have met the pre-requisites (${planCourse.course.preRequisites}) for ${planCourse.course.code} - ${planCourse.course.title} in this semester.`)
                }
                else if (!postReqsMet) {
                    setShowCommonAlert(true)
                    setCommonAlertHeader("Cannot move here")
                    setCommonAlertBody(`${planCourse.course.code} - ${planCourse.course.title} is a pre-requisite for some course(s) in/before this semester.`)
                } else {
                    // Adding course to new semester
                    droppedSem.courses.push(planCourse)

                    // Remove course from old semester
                    if (dragData.draggedCourseId || dragData.draggedPackageId)
                        oldSemCourseList.splice(oldCourseIndex, 1)

                    setSelectedPlan(updatedPlan)
                    setPlanHasChanged(true)
                }
            }

            setIsDropped(false)
        }
    }, [isDropped, selectedPlan])

    function drop(e) {
        const yearIndex = e.currentTarget.dataset.yearindex
        const semIndex = e.currentTarget.dataset.semindex
        const draggedCourseId = e.dataTransfer.getData('courseId');
        const draggedPackageId = e.dataTransfer.getData('packageId');
        const draggedCourseYearIndex = e.dataTransfer.getData('courseYearIndex');
        const draggedCourseSemIndex = e.dataTransfer.getData('courseSemIndex');

        localStorage.setItem('dragData', JSON.stringify({
            yearIndex, semIndex, draggedCourseId, draggedPackageId, draggedCourseYearIndex, draggedCourseSemIndex
        }))

        setIsDropped(true)
    }

    function handleDeleteYear(yearIndex) {
        setSelectedPlan(prev => {
            const tempPlan = JSON.parse(JSON.stringify(prev))
            tempPlan.plan.splice(yearIndex, 1)
            return tempPlan
        })
    }

    return (
        <Box minW={"225px"}>
            <CommonAlert
                isOpen={showCommonAlert}
                onClose={() => setShowCommonAlert(false)}
                header={commonAlertHeader}
                body={commonAlertBody}
            />

            <Center alignItems={'flex-start'}>
                <Text fontWeight={'bold'} fontSize={'2xl'} mb={5}>Year {yearIndex + 1}</Text>
                {yearEmpty &&
                    <IconButton
                        variant={'ghost'}
                        size={'md'}
                        color='red.600'
                        icon={<MdDelete />}
                        onClick={() => handleDeleteYear(yearIndex)}
                    />
                }
            </Center>

            <Flex direction='column' gap={2}>
                {
                    data.map((semData, index) =>
                        <SemesterCard
                            key={index} data={semData}
                            semIndex={index} yearIndex={yearIndex}
                            onDrop={drop} setSelectedPlan={setSelectedPlan}
                            setSelectedPlanCourse={setSelectedPlanCourse}
                            setPlanHasChanged={setPlanHasChanged}
                            onOpenInfoModal={onOpenInfoModal}
                            onOpenPkgModal={onOpenPkgModal}
                        />
                    )
                }
            </Flex>
        </Box>
    )
}

function SemesterCard({
    semIndex, yearIndex, data, onDrop, setSelectedPlan,
    setSelectedPlanCourse, setPlanHasChanged, onOpenInfoModal, onOpenPkgModal
}) {
    function allowDrop(e) {
        //can do a simple check to see if year or semvalues are missing
        //and if so, we get the parent element else we use the target element.
        //This will require dragOver to be in cardbody tag.
        e.stopPropagation()
        e.preventDefault()
    }

    function onDragStart(e) {
        //transfering dragged course name, year and sem to the dataTransfer object which basically holds values during drag/drop
        e.dataTransfer.setData('courseId', e.target.dataset.courseid)
        e.dataTransfer.setData('packageId', e.target.dataset.packageid)
        e.dataTransfer.setData('courseYearIndex', e.currentTarget.dataset.yearindex)
        e.dataTransfer.setData('courseSemIndex', e.currentTarget.dataset.semindex)
    }

    function handleRemoveCourse(event, index) {
        event.stopPropagation() // prevent course info modal opening

        const updatedCourses = JSON.parse(JSON.stringify(data.courses))
        updatedCourses.splice(index, 1)

        setSelectedPlan(prev => {
            const prevTemp = JSON.parse(JSON.stringify(prev))
            prevTemp.plan[yearIndex][semIndex].courses = updatedCourses
            return prevTemp
        })

        setPlanHasChanged(true)
    }

    const [show, setShow] = useBoolean()

    useEffect(() => {
        data.courses.length ? setShow.on() : setShow.off()
    }, [data.courses])

    let semCredits = 0
    for (const planCourse of data.courses) {
        // Add 3 credits if it's a package/elective course
        semCredits += planCourse.courseId ? planCourse.course.creditHours : 3
    }

    return (
        <Card
            size='md' mb={2}
            onDrop={onDrop}
            onDragOver={allowDrop}
            data-yearindex={yearIndex}
            data-semindex={semIndex}
            backgroundColor={"#F4F4F4"}
        >
            <CardHeader pb={1}>
                <Flex justify='space-between' align='center'>
                    <Box>
                        <Heading size='md' mb={1}>
                            {data.name}
                        </Heading>
                        <Text>{semCredits} Credit Hours</Text>
                    </Box>

                    <IconButton
                        aria-label='Collapse Semester'
                        icon={<AiFillCaretDown />}
                        onClick={setShow.toggle}
                    />
                </Flex>
            </CardHeader>

            {show &&
                <CardBody pt={1} as='b'>
                    {
                        data.courses.map((planCourse, index) =>
                            <Card
                                backgroundColor={'white'}
                                data-yearindex={yearIndex}
                                data-semindex={semIndex}
                                data-courseid={planCourse.courseId}
                                data-packageid={planCourse.packageId}
                                onDragStart={onDragStart}
                                onDrop={onDrop}
                                key={index}
                                p={2} my={2}
                                _hover={{ "cursor": "grab" }}
                                onClick={() => {
                                    setSelectedPlanCourse(planCourse)
                                    if (planCourse.packageId) onOpenPkgModal()
                                    else onOpenInfoModal()
                                }}
                                draggable
                            >
                                <Flex justifyContent={'space-between'}>
                                    {planCourse.packageId ?
                                        <>
                                            {planCourse.course ?
                                                <Flex direction={'column'}>
                                                    <Text fontSize={'sm'}
                                                        fontWeight={'semibold'}>{planCourse.package.name}</Text>
                                                    <Text>{planCourse.course.title}</Text>
                                                </Flex>
                                                :
                                                <Text>{planCourse.package.name}</Text>
                                            }
                                        </>
                                        :
                                        <Text>{planCourse.course.title}</Text>
                                    }
                                    {!planCourse.planRequiredCourse &&
                                        <IconButton
                                            color={'red'}
                                            size={'xs'}
                                            variant={'outline'}
                                            icon={<MdClose />}
                                            onClick={(e) => handleRemoveCourse(e, index)}
                                        />
                                    }
                                </Flex>
                            </Card>
                        )
                    }
                </CardBody>
            }
        </Card>
    )
}

function CommonAlert({ isOpen, onClose, header, body }) {
    return (
        <AlertDialog
            isOpen={isOpen}
            onClose={onClose}
            isCentered
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        {header}
                    </AlertDialogHeader>

                    <AlertDialogBody>{body}</AlertDialogBody>

                    <AlertDialogFooter>
                        <Button onClick={onClose}> Ok </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}