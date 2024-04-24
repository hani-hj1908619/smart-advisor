import {Box, Card, CardBody, Text} from "@chakra-ui/react";

export default function SearchReviewCard({queriedReview, review, onOpenDetailModal}) {


    return (
        <Card key={review.id}
              _hover={{"cursor": "pointer", bgColor: "rgba(0, 94, 255, 0.2)"}}
              sx={{bgColor: 'gray.100', mt:'2%'}}
              onClick={() => {
                  onOpenDetailModal();
                  queriedReview.current = review
              }}>
            <CardBody>
                {
                    review.instructorId ?
                        <Box>
                            <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.500' fontSize='md'>
                                {'INSTRUCTOR'}
                            </Text>
                            <Text fontWeight={'medium'} color='blackAlpha.800'>{review.instructor.name}</Text>
                        </Box>
                        :
                        <Box>
                            <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.500' fontSize='md'>
                                {'COURSE'}
                            </Text>
                            <Text fontWeight={'medium'} color='blackAlpha.800'>{review.course.code} - {review.course.title}</Text>
                        </Box>
                }
            </CardBody>
        </Card>
    )
}