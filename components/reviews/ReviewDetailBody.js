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

export default function ReviewDetailBody({review, reviewDist}) {

    const distributionStyle = {
        bgColor: 'orange.200',
        textAlign: 'center',
        borderColor: 'black',
        border: '1px solid',
        mb: '0.2%'
    }

    return (
        <HStack height='40%' justifyContent='space-between' mt='2%' mb='2%'>
            <Flex direction='column' width='30%'>
                <Box display='flex' flexDirection='row' alignItems='center'
                     justifyContent='space-between'>
                    <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.500' fontSize='5xl'>
                        {review.course ? 'MATERIAL' : 'TEACHING'}
                    </Text>
                    <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.700' fontSize='5xl'>
                        {review.course ? reviewDist.material : reviewDist?.teaching}
                    </Text>
                </Box>
                <Box display='flex' flexDirection='row' alignItems='center'
                     justifyContent='space-between'>
                    <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.500' fontSize='5xl'>
                        {review.course ? 'DIFFICULTY' : 'GRADING'}
                    </Text>
                    <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.700' fontSize='5xl'>
                        {review.course ? reviewDist.difficulty : reviewDist?.grading}
                    </Text>
                </Box>
                <Box display='flex' flexDirection='row' alignItems='center'
                     justifyContent='space-between'>
                    <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.500' fontSize='5xl'>
                        {review.course ? 'COURSE LOAD' : 'OVERALL'}
                    </Text>
                    <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.700' fontSize='5xl'>
                        {review.course ? reviewDist.courseLoad : reviewDist?.overall}
                    </Text>
                </Box>
            </Flex>
            <Flex width='60%' height='100%' direction='column' alignItems='flex-end'>
                <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.500' fontSize='4xl'>
                    Distribution of review
                </Text>
                <Box height='50px'
                     width={review.course ? (reviewDist.material / 5) * 100 + '%' : (reviewDist.teaching / 5) * 100 + '%'}
                     sx={distributionStyle}>{review.course ? 'Material - ' + (reviewDist.material / 5) * 100 + '%' : 'Teaching - ' + (reviewDist.teaching / 5) * 100 + '%'}</Box>
                <Box height='50px'
                     width={review.course ? (reviewDist.difficulty / 5) * 100 + '%' : (reviewDist.grading / 5) * 100 + '%'}
                     sx={distributionStyle}>{review.course ? 'Difficulty - ' + (reviewDist.difficulty / 5) * 100 + '%' : 'Grading - ' + (reviewDist.grading / 5) * 100 + '%'}</Box>
                <Box height='50px'
                     width={review.course ? (reviewDist.courseLoad / 5) * 100 + '%' : (reviewDist.overall / 5) * 100 + '%'}
                     sx={distributionStyle}>{review.course ? 'Course Load - ' + (reviewDist.courseLoad / 5) * 100 + '%' : 'Overall - ' + (reviewDist.overall / 5) * 100 + '%'}</Box>
            </Flex>
        </HStack>
    )
}