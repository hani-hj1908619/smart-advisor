import {Box, Divider, Text, HStack, Flex} from "@chakra-ui/react";

export default function ReviewContent({
                                          color,
                                          ovr,
                                          reviewProperty1,
                                          reviewProperty2,
                                          reviewProperty3,
                                          reviewType,
                                          reviewTypeValue,
                                          reviewValue1,
                                          reviewValue2,
                                          reviewValue3
                                      }) {
    return (


        <Box height='60%'>
            <Box mb={2} display='flex' flexDirection='row' justifyContent='space-between'>
                <Flex direction='column'>
                    <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.500' fontSize='sm'>
                        {reviewType}
                    </Text>
                    <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.700' fontSize='md'>
                        {reviewTypeValue}
                    </Text>
                </Flex>
                <Flex direction='column' alignItems='center'>
                    <Text fontFamily={"sans-serif"} as='b' color='blackAlpha.500' fontSize='sm'>
                        OVR
                    </Text>
                    <Text fontFamily={"sans-serif"} as='b' color={color} fontSize='md'>
                        {ovr}
                    </Text>
                </Flex>
            </Box>
            <Divider/>

            <HStack justifyContent='space-between' height='100%' p='1%'>
                <Box display='flex' flexDirection='column' height='100%' justifyContent='space-evenly'>
                    <Text color='blackAlpha.700' fontWeight='medium' fontSize='sm'>{reviewProperty1}</Text>
                    <Text color='blackAlpha.700' fontWeight='medium' fontSize='sm'>{reviewProperty2}</Text>
                    <Text color='blackAlpha.700' fontWeight='medium' fontSize='sm'>{reviewProperty3}</Text>
                </Box>
                <Box display='flex' flexDirection='column' height='100%' justifyContent='center' alignItems='center'
                     width='1.5rem'>
                    <Text fontFamily={"sans-serif"} as='b' color='red.500'
                          fontSize='md'>{reviewValue1}</Text>
                    <Text fontFamily={"sans-serif"} as='b' color='orange.300'
                          fontSize='md'>{reviewValue2}</Text>
                    <Text fontFamily={"sans-serif"} as='b' color='green.500'
                          fontSize='md'>{reviewValue3}</Text>
                </Box>
            </HStack>
        </Box>


    )

}
                
   