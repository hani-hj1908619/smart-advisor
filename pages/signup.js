import {
    Box,
    Button,
    Center,
    Divider,
    Flex,
    FormControl, FormLabel,
    Heading,
    Image,
    Select,
    Spinner,
    Text,
    useSteps
} from "@chakra-ui/react";
import { Input } from "@nextui-org/react";
import { router } from "next/router";
import React, { use, useEffect, useRef, useState } from 'react';
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import SignUpStepper from "../components/signup/SignUpStepper";
import styles from "../styles/Home.module.css";

export default function Signup() {
    const [user, setUser] = useState({
        email: '',
        password: '',
        majorId: -1,
        collegeId: -1,
        joinYear: 2023,
        name: '',
        gender: ''
    })

    const [isWaiting, setIsWaiting] = useState(false)
    const [userExists, setUserExists] = useState(false)
    const { activeStep, setActiveStep } = useSteps({
        index: 1, count: 2,
    })

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


    async function handleSignUp() {
        setIsWaiting(true)

        if (validateEmail(user.email)) {
            const { email, ...userData } = user
            userData.id = parseInt(`20${email.slice(2)}`)
            const options = {
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData),
                method: 'POST'
            }

            const res = await fetch('http://localhost:3000/api/user', options)

            if (res.status === 404) {
                setActiveStep(activeStep + 1)
                helper.text = ''
                helper.color = ''
            } else setUserExists(true)
        }

        setIsWaiting(false)
    }

    function onChangeSignUp(e) {
        switch (e.target.name) {
            case 'email':
                setUser({ ...user, email: e.target.value })
                break;
            case 'password':
                setUser({ ...user, password: e.target.value })
                break;
        }
    }

    return (
        <>
            <header className={styles.header}>
                <Flex alignItems='center'>
                    <Image boxSize='30px' src='https://bit.ly/dan-abramov' alt='Dan Abramov' />
                    <Button variant="navButton">Degree Pilot</Button>
                </Flex>
            </header>

            <main className={styles.homepageMain} key={1}>
                <Box className={styles.body} width='100%'>
                    <Center height='70%' flexDirection='column' p='4%'>
                        <Center mb={'4%'}>
                            <SignUpStepper activeStep={activeStep} />
                        </Center>
                        {
                            activeStep === 1 && (<>
                                <Heading size='2xl'>Sign up</Heading>
                                <form>
                                    <FormControl>
                                        <Flex flexDirection='column' height='300px' justifyContent='space-evenly'>
                                            <Divider mt='5%' borderColor='gray.300' width='100%' />

                                            <Input
                                                defaultValue={user.id}
                                                onChange={(e) => onChangeSignUp(e)}
                                                name='email'
                                                status={helper.color || (isEmpty.email ? isEmpty.color : "")}
                                                color={helper.color || (isEmpty.email ? isEmpty.color : "")}
                                                helperColor={helper.color || (isEmpty.email ? isEmpty.color : "")}
                                                helperText={helper.text || (isEmpty.email ? isEmpty.text : "")}
                                                type="email"
                                                aria-label={'email input'}
                                                underlined
                                                labelLeft="Email"
                                                placeholder="201903213@qu.edu.qa"
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
                                                onChange={(e) => onChangeSignUp(e)}
                                                labelLeft="Password"
                                                visibleIcon={<MdVisibility />}
                                                hiddenIcon={<MdVisibilityOff />}
                                            />

                                            <Button
                                                size='xs' variant='link'
                                                onClick={() => router.push('/loginuser')}
                                            >
                                                Already have an account? Login here
                                            </Button>

                                            <Button
                                                isLoading={isWaiting} loadingText='Please wait'
                                                colorScheme='yellow' variant='ghost'
                                                type="submit"
                                                onClick={async (e) => {
                                                    e.preventDefault()
                                                    await handleSignUp();
                                                }}
                                            >
                                                Next
                                            </Button>

                                            {userExists &&
                                                <Center>
                                                    <Text fontSize='sm' color='tomato'>
                                                        User exists already!
                                                    </Text>
                                                </Center>
                                            }
                                        </Flex>
                                    </FormControl>
                                </form>
                            </>
                            )
                        }
                        {activeStep !== 1 &&
                            <MoveToStudentSettings
                                user={user} setUser={setUser}
                                activeStep={activeStep}
                                setActiveStep={setActiveStep}
                            />
                        }
                    </Center>
                </Box>
            </main>
            <footer>
                <Center textAlign='center'>
                    <Text sx={{ color: 'gray' }} width={'70%'}>
                        By clicking &quot;Sign up&quot; above, you acknowledge that you accept to be part of this
                        feedback process. Thank you, we hope you enjoy Degree Pilot.
                    </Text>
                </Center>
            </footer>
        </>)
}

function MoveToStudentSettings({ activeStep, setActiveStep, user }) {
    //student wont have tokens
    const majors = [{ "id": 26, "name": "Computer Science", "code": "CMSC", "collegeId": 5 }]
    const colleges = [{ "id": 1, "name": "Arts and Sciences" }, { "id": 2, "name": "Business and Economics" }, {
        "id": 3,
        "name": "Dental Medicine"
    }, { "id": 4, "name": "Education" }, { "id": 5, "name": "Engineering" }, {
        "id": 6,
        "name": "Foundation Program"
    }, { "id": 7, "name": "Health Sciences" }, { "id": 8, "name": "Law" }, { "id": 9, "name": "Medicine" }, {
        "id": 10,
        "name": "No College Designated"
    }, { "id": 14, "name": "Nursing" }, { "id": 11, "name": "Pharmacy" }, { "id": 12, "name": "QU Health" }, {
        "id": 13,
        "name": "Sharia and Islamic Studies"
    }]
    const genders = ['M', 'F']
    const [userNew, setUserNew] = useState(user)
    const [errorMsg, setErrorMsg] = useState(false)

    useEffect(() => {
        const { email, ...userData } = user
        userData.id = parseInt(`20${email.slice(2)}`)
        setUserNew(userData)
    }, [user])

    function onSubmitSignUp() {
        setErrorMsg(false)
        if (userNew.major !== -1 && userNew.collegeId !== -1
            && userNew.gender !== '' && userNew.name.trim() !== '') {

            const options = {
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userNew),
                method: "POST",
            };
            fetch('http://localhost:3000/api/user/signup/', options)
                .then((res) => {
                    if (res.status === 200) {
                        router.push('/loginuser')
                    }
                })
        } else setErrorMsg(true)
    }

    return (
        <Center width='100%' flexDirection='column'>
            <Heading fontFamily={'sans-serif'}>Choose your settings</Heading>
            <Flex flexDirection='column' width='100%' alignItems='center' height='320px'
                justifyContent='space-evenly'>
                <Flex width='100%' gap={40} alignItems='center' justifyContent='center'>
                    <Box>
                        <FormControl>
                            <FormLabel>Select your college</FormLabel>
                            <Select variant='flushed' onChange={(e) =>
                                setUserNew({ ...userNew, collegeId: parseInt(e.target.value) })}>
                                <option disabled selected>College</option>
                                {colleges && colleges.map((college) =>
                                    <option key={college.id}
                                        value={college.id}>{college.name}</option>)}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box>
                        <FormControl>
                            <FormLabel>Select your major</FormLabel>
                            <Select variant='flushed'
                                onChange={(e) =>
                                    setUserNew({ ...userNew, majorId: parseInt(e.target.value) })}>
                                <option selected disabled>Major</option>
                                {majors && majors.map((major) => <option key={major.id}
                                    value={major.id}>{major.name}</option>)}
                            </Select>
                        </FormControl>
                    </Box>
                </Flex>
                <Flex width='100%' gap={40} alignItems='center' justifyContent='center'>
                    <Box mr='3.5%'>
                        <FormControl>
                            <FormLabel>Enter your name</FormLabel>
                            <Input clearable underlined placeholder='Ex. Ibrahim'
                                defaultValue={userNew.name}
                                onChange={(e) => setUserNew({ ...userNew, name: e.target.value })} />
                        </FormControl>
                    </Box>
                    <Box>
                        <FormControl>
                            <FormLabel>Select your gender</FormLabel>
                            <Select variant='flushed'
                                onChange={(e) =>
                                    setUserNew({ ...userNew, gender: e.target.value })}>
                                <option selected disabled>Gender</option>
                                {genders && genders.map((gender) =>
                                    <option key={gender} value={gender}>
                                        {gender === 'M' ? 'Male' : 'Female'}</option>)}
                            </Select>
                        </FormControl>
                    </Box>
                </Flex>
                <Flex width={'20%'} justifyContent='space-between'>
                    <Button colorScheme={'red'} width='40%' variant='ghost'
                        onClick={() => setActiveStep(activeStep - 1)}>Back</Button>
                    <Button colorScheme={'facebook'} width='40%' variant='solid'
                        onClick={() => onSubmitSignUp()}>Sign up</Button>
                </Flex>
            </Flex>

            {errorMsg && <Text as='b' fontFamily='sans-serif' sx={{ color: 'red' }}>*Please fill all the fields</Text>}
        </Center>
    )
}