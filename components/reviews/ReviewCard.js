import {Box, Card} from "@chakra-ui/react";
import ReviewContent from './ReviewContent.js'
import {calculateReviewOVR} from '../../utils/reviewsFunctions.js';

export default function ReviewCard({height = '100%', width = '25em', review}) {


    function getOVRColor() {
        const ovr = calculateReviewOVR(review)
        if (parseFloat(ovr) >= 4)
            return 'green.500'
        else if (parseFloat(ovr) >= 2.6)
            return 'orange.400'
        else
            return 'red.600'
    }

    return (
        <Card
            variant='outline' p={2}
            width={width} height={height}
            sx={{
                bgColor: 'rgba(165, 203, 255, 0.06)', stroke: 'rgba(165, 203, 255, 0.4)'
            }}
        >
            <Box p={2} height='100%'>
                {review.instructorId ? (
                    <ReviewContent reviewType={'INSTRUCTOR'} reviewTypeValue={review.instructor.name}
                                   ovr={calculateReviewOVR(review)}
                                   color={getOVRColor()} reviewProperty1={'Teaching'} reviewProperty2={'Grading'}
                                   reviewProperty3={'Overall'}
                                   reviewValue1={review.teaching} reviewValue2={review.grading}
                                   reviewValue3={review.overall}/>

                ) : (

                    <ReviewContent reviewType={'COURSE'} reviewTypeValue={review.course.title}
                                   ovr={calculateReviewOVR(review)}
                                   color={getOVRColor()} reviewProperty1={'Material'} reviewProperty2={'Difficulty'}
                                   reviewProperty3={'Course Load'}
                                   reviewValue1={review.material} reviewValue2={review.difficulty}
                                   reviewValue3={review.courseLoad}/>
                )}
            </Box>
        </Card>
    )
}