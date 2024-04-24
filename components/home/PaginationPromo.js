import { Box, Button, Flex, Heading, Image, Text, VStack } from "@chakra-ui/react";

export default function PaginationPromo({ title, textBody, image, transitionClass, isMobile }) {

    return (
        <Box sx={{ transition: 'opacity 0.9s linear', opacity: transitionClass }}>
            {isMobile? (<Box>
                <Flex height='40%' width='100%' justifyContent='space-between'
                      alignItems={'center'} flexDirection='column'>
                    <Image
                        p={4}
                        borderRadius='25px'
                        height='250px'
                        width='450px'
                        fallbackSrc='https://via.placeholder.com/150'
                        objectFit='fill'
                        src={image}
                        alt='Dan Abramov'
                    />

                    <VStack p={8} maxW='22rem' height='100%' justifyContent='space-between' alignItems='flex-start'>
                        <Heading fontSize='1.5rem'>{title}</Heading>
                        <Text>
                            {textBody}
                        </Text>
                        <Button>Learn more</Button>
                    </VStack>

                </Flex>
            </Box>) : (<Box>
                <Flex height='300px' width='100%' justifyContent='space-between' alignItems={'center'}>
                    <VStack p={8} maxW='22rem' height='100%' justifyContent='space-between' alignItems='flex-start'>
                        <Heading fontSize='1.5rem'>{title}</Heading>
                        <Text>
                            {textBody}
                        </Text>

                        <Button>Learn more</Button>
                    </VStack>
                    <Image
                        p={4}
                        borderRadius='25px'
                        height='250px'
                        width='450px'
                        fallbackSrc='https://via.placeholder.com/150'
                        objectFit='fill'
                        src={image}
                        alt='Dan Abramov'
                    />
                </Flex>
            </Box>)}
        </Box>
    )
}