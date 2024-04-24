import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Card,
    CardHeader,
    Center,
    Divider,
    Flex,
    HStack,
    Heading,
    IconButton,
    Text,
    useBoolean,
    useToast,
} from "@chakra-ui/react";
import { MdClose, MdContentCopy, MdSave } from "react-icons/md";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

import CommonAlert from "components/common/CommonAlert";
import Timetable from "components/common/Timetable";
import DetailedSchedule from "components/semester-schedule/DetailedSchedule";
import PreferenceForm from "components/semester-schedule/PreferenceForm";
import styles from "styles/Home.module.css";
import { withSessionSsr } from "../../utils/withSession";
import { getCookie } from "../api/util/getCookie";
import { verifyToken } from "../api/util/verifyToken";
import CommonHead from "../../components/common/CommonHead";

export const getServerSideProps = withSessionSsr(
    async function getServerSideProps({ req }) {
        const cookie = getCookie({ req }, "userSession");
        const userToken = cookie?.userToken;

        if (!req.session.user || verifyToken(userToken) == null) {
            return {
                redirect: {
                    destination: "/loginuser",
                    permanent: false,
                },
            };
        }


        const { id: userId, gender: gender, joinYear: joinYear } = req.session.user;

        // Get saved user sem schedule if any
        let res = await fetch(
            `http://localhost:3000/api/user/${userId}/schedule?joinYear=${joinYear}`,
            { headers: { Authorization: `bearer ${userToken}` } }
        );
        res = await res.json();
        const schedule = res;

        return {
            props: { serverSchedule: schedule, userId, userToken, gender, joinYear },
        };
    }
);

export default function SemesterSchedule({
    serverSchedule,
    userId,
    userToken,
    gender,
    joinYear
}) {
    const [schedule, setSchedule] = useState(serverSchedule.schedule);
    const [scheduleOutdated, setScheduleOutdated] = useState(
        serverSchedule.scheduleOutdated
    );

    const [scheduleUnchanged, setScheduleUnchanged] = useState(
        JSON.parse(JSON.stringify(serverSchedule.schedule))
    );

    const [showPrefs, setShowPrefs] = useBoolean();
    const [prefFormMessage, setPrefFormMessage] = useState("")
    const [unsavedChanges, setUnsavedChanges] = useBoolean();
    const [showUnsavedAlert, setShowUnsavedAlert] = useBoolean();
    const [showDiscardAlert, setShowDiscardAlert] = useBoolean();

    const [errors, setErrors] = useState({
        error: false,
        noPlan: false,
        notPossible: false,
        package: false,
        description: null,
    });

    if (!schedule.length || scheduleOutdated) {
        // If no schedule generated or plan was updated after prev generation - gen new schedule
        if (!showPrefs && !errors.error) {
            setPrefFormMessage("The saved semester schedule is outdated and needs to be regenerated.")
            setShowPrefs.on();
        }
    }

    const commonToast = useToast();
    const commonToastOptions = { duration: 2000, isClosable: true };

    async function saveSchedule() {
        const res = await fetch(
            `http://localhost:3000/api/user/${userId}/schedule`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `bearer ${userToken}`,
                },
                body: JSON.stringify({ schedule }),
            }
        );

        if (res.ok) {
            commonToast({
                title: "Schedule saved",
                status: "success",
                ...commonToastOptions,
            });
            setUnsavedChanges.off();
        } else
            commonToast({
                title: "Something went wrong",
                status: "error",
                ...commonToastOptions,
            });
    }

    function handleCrnCopy() {
        const crnData = schedule
            .filter((s) => s.section)
            .map((s) => s.section.crn)
            .join(",");
        navigator.clipboard.writeText(crnData);
        commonToast({
            title: "Schedule CRNs copied to clipboard",
            status: "success",
            ...commonToastOptions,
        });
    }

    return (
        <>
            <CommonHead
                title={'DP - Semester Schedule'} name={'description'}
                content={'See your upcoming schedule and list of sections while also giving you the control to edit section timings.'}
                iconLoc={'/logo.ico'}
            />

            <main className={styles.main}>
                <PreferenceForm
                    userId={userId}
                    gender={gender}
                    joinYear={joinYear}
                    showPrefs={showPrefs}
                    setShowPrefs={setShowPrefs}
                    setSchedule={setSchedule}
                    setScheduleOutdated={setScheduleOutdated}
                    setScheduleUnchanged={setScheduleUnchanged}
                    setUnsavedChanges={setUnsavedChanges}
                    setErrors={setErrors}
                    message={prefFormMessage}
                />

                {errors.error ? (
                    <>
                        {errors.noPlan && (
                            <GoToPlanAlert
                                alertBodyText={
                                    "Please create a main degree plan to be followed for semester scheduling."
                                }
                            />
                        )}
                        {(errors.notPossible || errors.package) && (
                            <GoToPlanAlert
                                alertBodyText={`
                                Review your degree plan and update the course list.`}
                                description={errors.description}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <CommonAlert
                            isOpen={showDiscardAlert}
                            onClose={setShowDiscardAlert.off}
                            type={"discard"}
                            handleFn={() => {
                                setSchedule(JSON.parse(JSON.stringify(scheduleUnchanged)));
                                setUnsavedChanges.off();
                                setShowDiscardAlert.off();
                            }}
                        />

                        <CommonAlert
                            isOpen={showUnsavedAlert}
                            onClose={setShowUnsavedAlert.off}
                            type={"unsaved"}
                        />

                        <HStack justify={"center"} alignItems={"baseline"} spacing={"2rem"}>
                            <Heading fontWeight={"bold"} fontSize={"2xl"}>
                                Fall 2022 Schedule
                            </Heading>

                            {unsavedChanges ? (
                                <Flex align={"center"} gap={2}>
                                    <Text
                                        fontSize="sm"
                                        sx={{
                                            color: "gray",
                                            fontSize: "0.9rem",
                                            fontStyle: "italic",
                                            fontWeight: 600,
                                            letterSpacing: "-0.001em",
                                            lineHeight: "20px",
                                        }}
                                    >
                                        * unsaved changes
                                    </Text>

                                    <IconButton
                                        variant="outline"
                                        size={"sm"}
                                        onClick={saveSchedule}
                                        icon={<MdSave />}
                                    />
                                    <IconButton
                                        variant="outline"
                                        size={"sm"}
                                        onClick={setShowDiscardAlert.on}
                                        icon={<MdClose />}
                                    />
                                </Flex>
                            ) : (
                                <Button
                                    size={"xs"}
                                    onClick={handleCrnCopy}
                                    leftIcon={<MdContentCopy />}
                                >
                                    Copy CRNs
                                </Button>
                            )
                            }

                            <Button
                                size={"sm"} colorScheme="blue" ml={"auto"}
                                onClick={() => {
                                    setPrefFormMessage("")
                                    setShowPrefs.on();
                                }}
                            >
                                Regenerate schedule
                            </Button>
                        </HStack>

                        <Divider borderColor={"blackAlpha.800"} />

                        {schedule && schedule.length && (
                            <Flex width="100%" gap={5} height="85vh">
                                <Card width="60%" p={3}>
                                    <CardHeader>
                                        <Center>
                                            <Heading fontWeight={"semibold"} fontSize={"2xl"} pb={2}>
                                                Timetable
                                            </Heading>
                                        </Center>
                                    </CardHeader>
                                    <Timetable height={'700px'} overflow={'auto'} schedule={schedule} />
                                </Card>

                                <Card width="40%" height={"100%"}>
                                    <DetailedSchedule
                                        schedule={schedule}
                                        setSchedule={setSchedule}
                                        setUnsavedChanges={setUnsavedChanges}
                                    />
                                </Card>
                            </Flex>
                        )}
                    </>
                )}
            </main>
        </>
    );
}

function GoToPlanAlert({ alertBodyText, description }) {
    const router = useRouter();

    function navToDegreePlan() {
        router.push("/degree-plan");
    }

    return (
        <AlertDialog isOpen={true} onClose={navToDegreePlan}>
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Unable to generate schedule
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        <Text>{alertBodyText}</Text>

                        {description && (
                            <Box mt={2}>
                                <Text as="b">Details: </Text>
                                <Text>{description}</Text>
                            </Box>
                        )}
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button onClick={navToDegreePlan}>Go to Degree Plan</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
}
