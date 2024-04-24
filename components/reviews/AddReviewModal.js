import {
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Text
} from "@chakra-ui/react";
import CommonSlider from 'components/common/CommonSlider.js';
import { useState } from "react";

export default function AddReviewModal({ data, isOpen, onClose, finalFocusRef, handleSubmit }) {
    const [review, setReview] = useState({})

    const [reviewType, setReviewType] = useState('')

    const [teaching, setTeaching] = useState(1)
    const [grading, setGrading] = useState(1)
    const [overall, setOverall] = useState(1)
    const [material, setMaterial] = useState(1)
    const [difficulty, setDifficulty] = useState(1)
    const [courseLoad, setCourseLoad] = useState(1)

    function handleReviewTypeChange(value) {
        setReviewType(value)

        if (value == "instructor") {
            setTeaching(1)
            setGrading(1)
            setOverall(1)
            setReview({ teaching, grading, overall })
        }
        else if (value == "course") {
            setMaterial(1)
            setDifficulty(1)
            setCourseLoad(1)
            setReview({ material, difficulty, courseLoad })
        }
    }

    function onModalClose() {
        setReviewType('')
        onClose()
    }

    return (
        <Modal finalFocusRef={finalFocusRef} isOpen={isOpen} onClose={onModalClose} isCentered size='xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add review</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl>
                        <FormLabel>Review type</FormLabel>
                        <RadioGroup
                            value={review.reviewType}
                            onChange={handleReviewTypeChange}
                        >
                            <HStack>
                                <Radio value='instructor'>Instructor</Radio>
                                <Radio value='course'>Course</Radio>
                            </HStack>
                        </RadioGroup>
                    </FormControl>
                    {
                        reviewType === 'instructor' && (
                            <Box>
                                <FormControl mt='2%'>
                                    <FormLabel >
                                        Select instructor to review
                                    </FormLabel>

                                    <Select
                                        placeholder='Instructor' size='sm' width='15rem'
                                        onChange={(e) => {
                                            if (e.target.value !== 'instructor')
                                                setReview({
                                                    instructorId: parseInt(e.target.value),
                                                    ...review
                                                })
                                        }}
                                    >
                                        {data.pastInstructors.map((instructor, index) =>
                                            <option
                                                key={index} value={instructor.id}
                                                disabled={instructor.existingReview}
                                            >
                                                {instructor.name}
                                            </option>
                                        )}
                                    </Select>
                                </FormControl>

                                <Divider mt={2} />

                                <Box p={2}>
                                    <FormControl mt={3}>
                                        <FormLabel>Teaching</FormLabel>
                                        <CommonSlider
                                            onChange={(val) => setTeaching(val)}
                                            sliderValue={teaching}
                                            onChangeEnd={(val) => setReview({
                                                ...review,
                                                teaching: val
                                            })}
                                        />
                                    </FormControl>
                                    <FormControl mt={3}>
                                        <FormLabel>Grading</FormLabel>
                                        <CommonSlider
                                            onChange={(val) => setGrading(val)}
                                            sliderValue={grading}
                                            onChangeEnd={(val) => setReview({
                                                ...review,
                                                grading: val
                                            })}
                                        />
                                    </FormControl>
                                    <FormControl mt={3}>
                                        <FormLabel>Overall</FormLabel>
                                        <CommonSlider
                                            onChange={(val) => setOverall(val)}
                                            sliderValue={overall}
                                            onChangeEnd={(val) => setReview({
                                                ...review,
                                                overall: val
                                            })}
                                        />
                                    </FormControl>
                                </Box>
                            </Box>
                        )
                    }
                    {
                        reviewType === 'course' && (
                            <Box>
                                <FormControl mt={5}>
                                    <FormLabel >
                                        Select course to review
                                    </FormLabel>

                                    <Select
                                        placeholder='Course' size='sm'
                                        width='15rem'
                                        onChange={(e) => {
                                            if (e.target.value !== 'course')
                                                setReview({
                                                    courseId: parseInt(e.target.value),
                                                    ...review
                                                })
                                        }}
                                    >
                                        {data.pastCourses.map((course, index) =>
                                            <option
                                                key={index} value={course.id}
                                                disabled={course.existingReview}
                                            >
                                                {course.title}
                                            </option>
                                        )}
                                    </Select>
                                </FormControl>

                                <Divider mt={2} />

                                <Box mt={1} display='flex' flexDirection='column'
                                    p={2}>
                                    <FormControl mt={3}>
                                        <FormLabel>Material</FormLabel>
                                        <CommonSlider
                                            onChange={(val) => setMaterial(val)}
                                            sliderValue={material}
                                            onChangeEnd={(val) => setReview({
                                                ...review,
                                                material: val
                                            })}
                                        />
                                    </FormControl>
                                    <FormControl mt={3}>
                                        <FormLabel>Difficulty</FormLabel>
                                        <CommonSlider
                                            onChange={(val) => setDifficulty(val)}
                                            sliderValue={difficulty}
                                            onChangeEnd={(val) => setReview({
                                                ...review,
                                                difficulty: val
                                            })}
                                        />
                                    </FormControl>
                                    <FormControl mt={3}>
                                        <FormLabel>Course load</FormLabel>
                                        <CommonSlider
                                            onChange={(val) => setCourseLoad(val)}
                                            sliderValue={courseLoad}
                                            onChangeEnd={(val) => setReview({
                                                ...review,
                                                courseLoad: val
                                            })}
                                        />
                                    </FormControl>
                                </Box>
                            </Box>
                        )
                    }
                </ModalBody>

                <ModalFooter justifyContent={'center'}>
                    {reviewType &&
                        <Button
                            colorScheme='yellow'
                            width='80%' mr={3} mt={3}
                            onClick={(e) => {
                                if (review.courseId || review.instructorId) {
                                    handleSubmit(review)
                                    onModalClose()
                                }
                            }}
                        >
                            Submit review
                        </Button>
                    }
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}