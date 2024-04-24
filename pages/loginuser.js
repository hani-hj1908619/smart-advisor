import { Box, Button, Center, Divider, Flex, FormControl, Heading, Image, Text, useSteps }
    from "@chakra-ui/react";
import styles from "../styles/Home.module.css";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useEffect, useState } from "react";
import React from 'react'
import { Input } from "@nextui-org/react";
import { router } from "next/router";
import CommonHead from "../components/common/CommonHead";

export default function Loginuser() {
    const [user, setUser] = useState({
        email: '',
        password: ''
    })
    const [isWaiting, setIsWaiting] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const validateEmail = (value) => {
        const email = value.split('@')
        const id = email[0].slice(2)
        if (!isNaN(email[0].slice(0, 2)) || isNaN(id) || id.length != 7 || (email[1] !== 'qu.edu.qa'))
            return false
        return true
    };

    const [isEmpty, setIsEmpty] = useState({ email: false, password: false, text: "", color: "" })

    const helper = React.useMemo(() => {
        if (!user.email)
            return {
                text: "",
                color: "",
            };
        const isValid = validateEmail(user.email);

        return {
            text: !isValid && 'Enter a valid email (e.g., hj1908619@qu.edu.qa)',
            color: (isValid === 'id' || isValid === false) && 'error',
        };
    }, [user.email]);

    function onChangeLoginField(e) {
        setIsEmpty({ email: false, password: false, text: "", color: "" })
        switch (e.target.name) {
            case 'email':
                setUser({ ...user, email: e.target.value })
                break;
            case 'password':
                setUser({ ...user, password: e.target.value })
                break;
        }
    }

    async function onLogin() {
        if (!user.email || !user.password) {
            setIsEmpty({ email: !user.email, password: !user.password, text: "Required field", color: "error" })
            return
        }

        const emailValid = validateEmail(user.email)
        if (emailValid) {
            setIsWaiting(true)

            const options = {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({
                    id: parseInt(`20${user.email.slice(2)}`),
                    password: user.password
                }),
            };

            const res = await fetch(`http://localhost:3000/api/user/`, options)

            if (res.status === 401 || res.status === 404) {
                //invalid details - unauthorized
                setErrorMsg('Invalid credentials. Try again.')
            } else if (res.status === 500) {
                //failed
                setErrorMsg('Unexpected Error. Try again later.')
            }
            else {
                const data = await res.json();
                if (typeof window !== undefined) {
                    localStorage.clear()
                    localStorage.setItem("user", JSON.stringify(data));
                }
                await router.push("/dashboard");
            }
            setIsWaiting(false)
        }
        else {
        }
    }

    return (
        <>
            <CommonHead title={'DP - Login'} name={'description'}
                        content={'Login to degree pilot and start a new and seamless college experience.'}
                        iconLoc={'/logo.ico'}/>

            <header className={styles.header}>
                <Flex alignItems='center'>
                    <Image boxSize='30px' src='/logo.svg' alt='Logo' />
                    <Button variant="navButton">Degree Pilot</Button>
                </Flex>
            </header>

            <main className={styles.homepageMain} key={1}>
                <Box className={styles.body} width='100%'>
                    <Center height='70%' flexDirection='column' p='8%'>
                        <Heading size='2xl'>Login</Heading>

                        <form>
                            <FormControl>
                                <Flex flexDirection='column' height='300px' justifyContent='space-evenly'>
                                    <Divider mt='5%' borderColor='gray.300' width='100%' />
                                    <Input
                                        defaultValue={user.id}
                                        onChange={(e) => onChangeLoginField(e)}
                                        name='email'
                                        status={helper.color || (isEmpty.email ? isEmpty.color : "")}
                                        color={helper.color || (isEmpty.email ? isEmpty.color : "")}
                                        helperColor={helper.color || (isEmpty.email ? isEmpty.color : "")}
                                        helperText={helper.text || (isEmpty.email ? isEmpty.text : "")}
                                        type="email"
                                        aria-label={'email input'}
                                        underlined
                                        labelLeft="Email"
                                        placeholder="hj1908619@qu.edu.qa"
                                    />

                                    <Input.Password
                                        underlined
                                        aria-label={'password input'}
                                        name='password'
                                        status={isEmpty.password ? isEmpty.color : ""}
                                        color={isEmpty.password ? isEmpty.color : ""}
                                        helperColor={isEmpty.password ? isEmpty.color : ""}
                                        helperText={isEmpty.password ? isEmpty.text : ""}
                                        defaultValue={user.password}
                                        onChange={(e) => onChangeLoginField(e)}
                                        labelLeft="Password"
                                        visibleIcon={<MdVisibility />}
                                        hiddenIcon={<MdVisibilityOff />} />
                                    {/*{<Button size='xs' onClick={() => router.push('/signup')} variant='link'>Don&apos;t*/}
                                    {/*    have an account? Sign up here</Button>}*/}

                                    <Button
                                        isLoading={isWaiting} loadingText='Please wait'
                                        colorScheme='yellow' type="submit" variant='outline'
                                        onClick={async (e) => {
                                            e.preventDefault()
                                            await onLogin()
                                        }}>
                                        Login
                                    </Button>

                                    {errorMsg.trim() !== '' &&
                                        <Center>
                                            <Text fontSize='sm' color='tomato'>
                                                {errorMsg}
                                            </Text>
                                        </Center>
                                    }
                                </Flex>
                            </FormControl>
                        </form>

                    </Center>
                </Box>
            </main>
        </>
    )
}