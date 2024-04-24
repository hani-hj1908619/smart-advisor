import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Box, Button, Text, HStack, Flex, VStack, Heading
} from '@chakra-ui/react'

export default function ReviewDetailHeader({review, reviewDist}){
    
    
    return(
       <HStack justifyContent='space-between' height='30%'>
            <Box display='flex' flexDirection='column' height='100%'>
                <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.500' fontSize='4xl'>
                    {review.course ? 'COURSE' : 'INSTRUCTOR'}
                </Text>
                <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.700' fontSize='5xl'>
                    {review.course ? review.course.title : review?.instructor?.name}
                </Text>
            </Box>
            <Box display='flex' flexDirection='row' height='100%' alignItems='center'>
                <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.500' fontSize='6xl'
                    sx={{
                    writingMode: 'vertical-rl',
                        textOrientation: 'sideways', //upright
                        lineHeight: '1.2em'
                }}>
                    OVR
                </Text>
                <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.700' fontSize='9xl'>
                    {review.course ? reviewDist.courseOvr : reviewDist.instructorOvr}
                </Text>
            </Box>
       </HStack>
    )
}