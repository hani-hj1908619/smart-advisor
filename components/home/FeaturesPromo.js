import {Flex, Heading, Image, Text} from "@chakra-ui/react";

export default function featuresPromo({title, description, image, isMobile}) {

    return (
        <Flex flexDirection={isMobile ? 'column' : 'row'} height='60%' justifyContent='space-between'>
            {isMobile ? (
                <Flex mb='2%' alignItems='flex-start' flexDirection='column'>
                    <Heading size='lg'>{title}</Heading>
                    <Image
                        width='100%'
                        p={4}
                        borderRadius='25px'
                        height='300px'
                        fallbackSrc='https://via.placeholder.com/230'
                        objectFit='fill'
                        src={image}
                        alt='Dan Abramov'
                    />

                    <Flex flexDirection='column' width='55%' p={4}>
                        <Text mt='5%'>{description}</Text>
                    </Flex>
                </Flex>
            ) : (
                <>
                    <Image
                        width='40%'
                        p={4}
                        borderRadius='25px'
                        height='230px'
                        fallbackSrc='https://via.placeholder.com/230'
                        objectFit='fill'
                        src={image}
                        alt='Dan Abramov'
                    />

                    <Flex flexDirection='column' width='55%' p={4}>
                        <Heading size='lg'>{title}</Heading>
                        <Text mt='5%'>{description}</Text>
                    </Flex>
                </>)}
        </Flex>
    )
}