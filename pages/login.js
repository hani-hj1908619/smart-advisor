import {
    Card,
    CardBody,
    Spacer,
    Flex,
    CardHeader,
    Heading,
    Center,
    Box,
    Stack,
    HStack,
    Input,
    Divider,
    FormLabel,
    FormControl,
    Button,
    Image,
    FormErrorMessage,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure, IconButton, InputGroup,InputRightElement
} from "@chakra-ui/react";
import {useRouter} from "next/router";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import {useEffect, useRef, useState} from "react";
import {MdVisibility, MdVisibilityOff} from "react-icons/md";
import CommonHead from "../components/common/CommonHead";

export default function Home() {
    /***
     * DEPRECATED FOR NOW --- REMOVE AFTER USER TESTING.
     * @type {NextRouter}
     */
    const router = useRouter();

    const {isOpen, onOpen, onClose} = useDisclosure();
    const cancelRef = useRef();
    const platform = useRef();

    const [user, setUser] = useState({
        id: "",
        name: "",
        password: "",
        gender: "",
    });
    const [inputError, setInputError] = useState({
        emailError: false,
        passError: false,
    });
    const [networkError, setNetworkError] = useState(false);
    const [show, setShow] = useState(false)

    const isEmailIdValid = user.id.split("@")[0].trim() !== "";
    const isDomainValid = user.id.split("@")[1] === "qu.edu.qa";


    useEffect(() => {
        // TODO: this method is not supported by all browsers. Need to find a better method.
        //navigator.userAgentData.platform
        platform.current = navigator.userAgentData.platform;
        if (platform.current == "Android") onOpen();
    }, []);

    function onFormChange(e) {
        switch (e.target.name) {
            case "email":
                setUser({...user, id: e.target.value});
                break;
            case "password":
                setUser({...user, password: e.target.value});
                break;
        }
    }

    useEffect(() => {
        setNetworkError(false);
        setInputError({passError: false, emailError: false});
    }, [user.id, user.password]);


    function validateLogin() {
        //testing userid = 1
        if (parseInt(user.id) === 1) return true;
        if (!isEmailIdValid || user.password === "" || !isDomainValid) {
            return false;
        }
        //testing user
        else if (isDomainValid && user.password !== "") {
            return true;
        }
    }

    async function onLogin() {
        if (validateLogin()) {
            const options = {
                headers: {"Content-Type": "application/json"},
                method: "POST",
                body: JSON.stringify(user),
            };


            const res = await fetch(`http://localhost:3000/api/user/`, options);
            if (res.status === 401 || res.status === 404) {
                //invalid details - unauthorized
                setInputError({
                    passError: true,
                    emailError: true,
                });
            } else if (res.status === 500)
                //failed
                setNetworkError(true);
            else {
                const data = await res.json();
                if (typeof window !== undefined)
                    localStorage.setItem("user", JSON.stringify(data));
                await router.push("/dashboard");
            }
        } else
            setInputError({
                //validation error
                passError: user.password.trim() === "",
                emailError: (!isDomainValid || !isEmailIdValid),
            });
    }

    return (
        <>
            <CommonHead title={'DP - Login'} name={'description'}
                        content={'Login to degree pilot and start a new and seamless college experience.'}
                        iconLoc={'/logo.ico'}/>

            <main className={styles.main}>
                <Box
                    className={
                        platform.current === "Windows"
                            ? styles.loginDesktopContainer
                            : styles.loginMobileCard
                    }
                >
                    <Card
                        variant="outline"
                        sx={{
                            bgColor: "rgba(0, 102, 255, 0.13)",
                            border: "1px solid #97C4FF",
                            borderRadius: "8px",
                            padding: "2.5%",
                        }}
                        className={styles.loginCard}
                    >
                        <CardHeader>
                            <Heading size="md">Smart Advisor</Heading>
                            <Heading>{platform.current}</Heading>
                            <Heading size="xs">Planning made easy</Heading>
                        </CardHeader>
                        <CardBody>
                            <HStack spacing="24px">
                                <Stack width="50%" spacing="12">
                                    <Flex
                                        direction="column"
                                        className={
                                            platform.current === "Windows"
                                                ? ""
                                                : styles.loginMobileForm
                                        }
                                    >
                                        <form>
                                            <FormControl
                                                isInvalid={
                                                    inputError.emailError ||
                                                    inputError.passError ||
                                                    !isEmailIdValid ||
                                                    isDomainValid
                                                }
                                            >
                                                <FormLabel>Email</FormLabel>
                                                <Input //type='email'
                                                    autoComplete='username'
                                                    variant="filled"
                                                    isInvalid={inputError.emailError}
                                                    name="email"
                                                    sx={{bgColor: "#FFFFFF"}}
                                                    placeholder="example@qu.edu.qa"
                                                    value={user.id}
                                                    onChange={(e) => onFormChange(e)}
                                                />
                                                {inputError.emailError && (
                                                    <FormErrorMessage>
                                                        {(!isDomainValid)
                                                            ? "Email domain needs to be @qu.edu.qa"
                                                            : "Invalid Email"}
                                                    </FormErrorMessage>
                                                )}
                                                <Spacer/>
                                                <FormLabel>Password</FormLabel>
                                                <InputGroup size='md' >
                                                    <Input
                                                        id='password'
                                                        autoComplete='current-password'
                                                        name="password"
                                                        variant="filled"
                                                        isInvalid={inputError.passError}
                                                        type={show ? 'text' : 'password'}
                                                        sx={{bgColor: "#FFFFFF"}}
                                                        placeholder="Password"
                                                        value={user.password}
                                                        onChange={(e) => onFormChange(e)}
                                                    />
                                                    <InputRightElement width='2.5rem'>
                                                        <IconButton
                                                            variant='ghost'
                                                            size={'sm'}
                                                            my={"auto"}
                                                            icon={show ? <MdVisibility/> : <MdVisibilityOff/>}
                                                            onClick={() => {
                                                                setShow(!show)
                                                            }}
                                                        />
                                                    </InputRightElement>
                                                </InputGroup>
                                                {inputError.passError && (
                                                    <FormErrorMessage>
                                                        {user.password.trim() === ""
                                                            ? "Password field is empty"
                                                            : "Invalid Password"}
                                                    </FormErrorMessage>
                                                )}

                                                <Button
                                                    mt={4}
                                                    colorScheme="teal"
                                                    type="submit"
                                                    onClick={async (e) => {
                                                        e.preventDefault()
                                                        await onLogin();
                                                        // setCookie({}, 'userId', '1', {sameSite: 'strict'})
                                                    }}
                                                >
                                                    Login
                                                </Button>
                                                {networkError && (
                                                    <FormErrorMessage>
                                                        {"Unexpected error. Try again later."}
                                                    </FormErrorMessage>
                                                )}
                                            </FormControl>
                                        </form>
                                    </Flex>
                                </Stack>
                                <Box>
                                    <Center height="50px">
                                        <Divider colorScheme="#00000" orientation="vertical"/>
                                    </Center>
                                    <Image
                                        className={
                                            platform.current == "Windows"
                                                ? styles.loginDesktopImage
                                                : styles.loginMobileImage
                                        }
                                        sx={{}}
                                        src="/loginArrow.svg"
                                        alt="Login Arrow"
                                    />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>
                </Box>
                <AlertDialog
                    isOpen={isOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={onClose}
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Download our mobile app
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                To improve your mobile experience, download our mobile app from
                                your app store.
                            </AlertDialogBody>

                            <AlertDialogFooter>
                                <Button
                                    colorScheme="red"
                                    onClick={() => {
                                        onClose();
                                        router.push(
                                            "https://play.google.com/store/apps/details?id=com.lixiangdong.classschedule&hl=en&gl=US&pli=1"
                                        );
                                    }}
                                    ml={3}
                                >
                                    Download
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </main>
        </>
    );
}
