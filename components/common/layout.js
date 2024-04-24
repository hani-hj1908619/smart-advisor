import { ChevronDownIcon, SearchIcon } from "@chakra-ui/icons";
import {
    Avatar,
    Box,
    Button,
    Center,
    Divider,
    Flex,
    HStack,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Skeleton,
    SkeletonCircle,
    Spacer,
    Text, Tooltip,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { destroyCookie } from "nookies";
import { useEffect, useState } from "react";
import { getCookie } from "../../pages/api/util/getCookie";

export default function RootLayout({ children }) {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState();

    useEffect(() => {
        if (typeof window !== undefined) {
            if (localStorage.getItem('user') === null) {
                localStorage.clear()
                router.push('/')
            }
            setUserInfo(JSON.parse(localStorage.getItem("user")));
        }
    }, []);

    async function handleLogout() {
        const { userToken } = getCookie({}, "userSession");

        const options = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `bearer ${userToken}`,
            },
            method: "DELETE",
        };
        const res = await fetch("http://localhost:3000/api/user/", options);
        if (res.ok) {
            destroyCookie({}, "userSession");
            localStorage.clear();
            router.push("/loginuser");
        }
    }

    return (
        <Box px={2} py={0.5}>
            <header>
                <Box>
                    <HStack>
                        <Link href="/dashboard">
                            <Button variant="navButton">Degree Pilot</Button>
                        </Link>
                        <Center height="50px">
                            <Divider
                                orientation="vertical"
                                height="2rem"
                                borderColor={"blackAlpha.800"}
                            />
                        </Center>
                        <Link href="/degree-plan">
                            <Button variant="navButton">Degree plan</Button>
                        </Link>
                        <Link href="/semester-schedule">
                            <Button variant="navButton">Semester Schedule</Button>
                        </Link>
                        <Link href="/reviews">
                            <Button variant="navButton">Reviews</Button>
                        </Link>
                        {/* <Link href="https://forms.gle/qTDLqaD399APoKwn8">
                            <Tooltip label='start filling the form'>
                                <Button variant="navButton">Feedback Survey</Button>
                            </Tooltip>
                        </Link> */}

                        <Spacer />

                        <Menu>
                            <MenuButton
                                width={'200px'}
                                height={'50px'}
                                as={Button}
                                variant={"ghost"}
                                rightIcon={<ChevronDownIcon />}
                            >
                                {userInfo !== undefined ? (
                                    <Flex alignItems={'center'}>
                                        <Avatar
                                            size="sm"
                                            name={userInfo?.name}
                                        />
                                        <Flex ml="3" direction={"column"}>
                                            <Text fontWeight="bold" lineHeight={5}>{userInfo?.name}</Text>
                                            <Text fontSize="sm" lineHeight={4}>
                                                {userInfo?.major ? userInfo?.major : userInfo?.college}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                ) : (
                                    <Flex direction={"row"}>
                                        <SkeletonCircle size="10" />
                                        <Skeleton>
                                            <div></div>
                                        </Skeleton>
                                    </Flex>
                                )}
                            </MenuButton>
                            <MenuList>
                                <MenuItem onClick={async () => handleLogout()}>
                                    Log out
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </HStack>
                </Box>
            </header>
            <main>{children}</main>
        </Box>
    );
}
