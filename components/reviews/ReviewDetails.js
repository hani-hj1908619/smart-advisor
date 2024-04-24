import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Box, Button, Text, HStack, Divider, VStack, Heading, Spinner, Center
} from '@chakra-ui/react'
import React, {useState} from 'react'
import ReviewCard from './ReviewCard'
import ReviewDetailBody from "./ReviewDetailBody";
import ReviewDetailHeader from "./ReviewDetailHeader";
import {getCookie} from "../../pages/api/util/getCookie";

export default function ReviewDetails({isOpen, onClose, review}) {

    const {userToken} = getCookie({}, 'userSession')
    const [relatedReviews, setRelatedReviews] = React.useState([])
    const [reviewDist, setReviewDist] = React.useState({
        grading: 0,
        teaching: 0,
        material: 0,
        overall: 0,
        difficulty: 0,
        courseLoad: 0,
        courseOvr: 0,
        instructorOvr: 0
    })
    const [isLoading, setIsLoading] = useState(true)

    React.useEffect(() => {
        const options = {headers: {'Authorization': `bearer ${userToken}`}}

        if (review.course) {
            fetch(`http://localhost:3000/api/reviews?courseId=${review.courseId}`, options)
                .then(response => response.json())
                .then(data => {
                    setRelatedReviews(data)
                    setIsLoading(false)
                })

        } else {

            fetch(`http://localhost:3000/api/reviews?instructorId=${review.instructorId}`, options)
                .then(response => response.json())
                .then(data => {
                    setRelatedReviews(data)
                    setIsLoading(false)
                })

        }

    }, [review.course, review.courseId, review.instructorId])


    React.useEffect(() => {
        setReviewDist({
            grading: 0,
            teaching: 0,
            overall: 0,
            material: 0,
            difficulty: 0,
            courseLoad: 0,
            courseOvr: 0,
            instructorOvr: 0
        })
        for (let i = 0; i < relatedReviews.length; i++) {
            if (relatedReviews[i].course) {
                setReviewDist(prevState => ({
                    ...prevState,
                    material: prevState.material + parseFloat(relatedReviews[i].material),
                    difficulty: prevState.difficulty + parseFloat(relatedReviews[i].difficulty),
                    courseLoad: prevState.courseLoad + parseFloat(relatedReviews[i].courseLoad)
                }))
            } else
                setReviewDist(prevState => ({
                    ...prevState,
                    grading: prevState.material + parseFloat(relatedReviews[i].grading),
                    teaching: prevState.difficulty + parseFloat(relatedReviews[i].teaching),
                    overall: prevState.courseLoad + parseFloat(relatedReviews[i].overall)
                }))
        }
        setReviewDist(prevState => ({
            grading: (prevState.grading / (relatedReviews.length)).toFixed(1),
            teaching: (prevState.teaching / (relatedReviews.length)).toFixed(1),
            overall: (prevState.overall / (relatedReviews.length)).toFixed(1),
            material: (prevState.material / (relatedReviews.length)).toFixed(1),
            difficulty: (prevState.difficulty / (relatedReviews.length)).toFixed(1),
            courseLoad: (prevState.courseLoad / (relatedReviews.length)).toFixed(1),
            courseOvr: ((prevState.material + prevState.difficulty + prevState.courseLoad) / (relatedReviews.length * 5 * 3) * 5).toFixed(1),
            instructorOvr: (((prevState.grading + prevState.teaching + prevState.overall) / (relatedReviews.length * 5 * 3)) * 5).toFixed(1)
        }))

    }, [relatedReviews])


    return (
        <>
            <Modal onClose={onClose} size={'full'} isOpen={isOpen}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>
                        <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.700' fontSize='lg'>
                            Review Details - {review.course ? review.course.code : review?.instructor?.name}
                        </Text>
                    </ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>

                        {!isLoading ? (<>

                            <ReviewDetailHeader review={review} reviewDist={reviewDist}/>

                            <Divider borderColor='blackAlpha.500'/>

                            <ReviewDetailBody review={review} reviewDist={reviewDist}/>


                            <Divider borderColor='blackAlpha.500'/>
                            <Box mt='2%' height='30%'>
                                <Heading fontSize='4xl' color='blackAlpha.700' fontFamily={"sans-serif"}>Recent
                                    Reviews</Heading>

                                <Box mt='2%' sx={{overflowX: 'auto'}} height='100%'>
                                    <HStack alignItems='baseline' spacing={5} wrap='nowrap'
                                            sx={{width: 'fit-content'}}>
                                        {relatedReviews.map((review) =>
                                            <ReviewCard key={review.id} review={review}/>
                                        )}
                                    </HStack>
                                </Box>
                            </Box>
                        </>) : (<>
                            <Center>
                                <Spinner/>
                            </Center>
                        </>)}

                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}