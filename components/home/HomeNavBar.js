import {
    Box,
    Button,
    Container,
    Flex,
    HStack,
    Image
} from "@chakra-ui/react";
import Link from "next/link";

export default function HomeNavBar({ children }) {


    return (
        <Container px={2} py={2} maxW='container.lg'>
            <header>
                <Box width='100%'>
                    <HStack justifyContent='space-between'>
                        <Link href="/">
                            <Flex alignItems='center'>
                                <Image boxSize='30px' src='/logo.svg' alt='Logo' />
                                <Button variant="navButton">Degree Pilot</Button>
                            </Flex>
                        </Link>

                        <Flex>
                            <Link
                                target="_blank"
                                href="https://www.apkmirror.com/apk/microsoft-corporation/microsoft-planner/microsoft-planner-1-17-16-release/"
                            >
                                <Button variant="navButton">Download our app</Button>
                            </Link>
                            <Link href="/loginuser">
                                <Button variant="navButton">Login</Button>
                            </Link>
                        </Flex>
                    </HStack>
                </Box>
            </header>
            <main>{children}</main>
        </Container>)
}