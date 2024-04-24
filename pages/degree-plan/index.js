import {
    Button,
    Divider,
    Flex,
    HStack,
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    useBoolean,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import CommonAlert from "components/common/CommonAlert";
import AddCourseModal from "components/degree-plan/AddCourseModal";
import CourseInfo from "components/degree-plan/CourseInfo";
import GeneratePlanForm from "components/degree-plan/GeneratePlanForm";
import PackageCourseSelector from "components/degree-plan/PackageCourseSelector";
import PlanActionMenu from "components/degree-plan/PlanActionMenu";
import SidePanel from "components/degree-plan/SidePanel";
import YearCard from "components/degree-plan/YearCard";
import { saveAs } from "file-saver";
import { toBlob } from "html-to-image";
import Head from "next/head";
import { useEffect, useState } from "react";
import { MdAdd, MdClose, MdSave } from "react-icons/md";
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

        const { id: userId } = req.session.user;

        const res = await fetch(`http://localhost:3000/api/user/${userId}/plans`, {
            headers: { Authorization: `bearer ${userToken}` },
        });
        const userPlansDb = await res.json();

        return {
            props: { userPlansDb, userId, userToken },
        };
    }
);

export default function DegreePlan({ userPlansDb, userId, userToken }) {
    const [userPlans, setUserPlans] = useState(userPlansDb || []);
    const [selectedPlan, setSelectedPlan] = useState();
    const [selectedPlanUnchanged, setSelectedPlanUnchanged] = useState(null);
    const [planHasChanged, setPlanHasChanged] = useState(false);
    const [selectedPlanCourse, setSelectedPlanCourse] = useState(null);

    const commonToast = useToast();
    const commonToastOptions = { duration: 2000, isClosable: true };

    const {
        isOpen: isOpenAddModal,
        onOpen: onOpenAddModal,
        onClose: onCloseAddModal,
    } = useDisclosure(); // Add course modal
    const {
        isOpen: isOpenRenameModal,
        onOpen: onOpenRenameModal,
        onClose: onCloseRenameModal,
    } = useDisclosure(); // Rename plan modal
    const {
        isOpen: isOpenInfoModal,
        onOpen: onOpenInfoModal,
        onClose: onCloseInfoModal,
    } = useDisclosure(); // Course info modal
    const {
        isOpen: isOpenPkgModal,
        onOpen: onOpenPkgModal,
        onClose: onClosePkgModal,
    } = useDisclosure(); // Package course select modal

    const [showGenerateForm, setShowGenerateForm] = useBoolean();
    const [showDelPlanAlert, setShowDelPlanAlert] = useBoolean();
    const [showUnsavedAlert, setShowUnsavedAlert] = useBoolean();
    const [showDiscardAlert, setShowDiscardAlert] = useBoolean();

    useEffect(() => {
        setMainPlanAsSelected(userPlansDb);
    }, []);

    function setMainPlanAsSelected(planList) {
        if (planList.length) {
            let mainPlanFound = false;
            for (const plan of planList) {
                if (plan.mainPlan) {
                    setSelectedPlan(plan);
                    setSelectedPlanUnchanged(JSON.parse(JSON.stringify(plan)));
                    mainPlanFound = true;
                    break;
                }
            }
            if (!mainPlanFound) {
                const plan = planList[planList.length - 1];
                setSelectedPlan(plan);
                setSelectedPlanUnchanged(JSON.parse(JSON.stringify(plan)));
            }
        } else {
            setSelectedPlan(null);
            setSelectedPlanUnchanged(null);
            setShowGenerateForm.on();
        }
    }

    async function generateNewStudyPlan(selectedMajorId, selectedSemesterId) {
        try {
            const res = await fetch(
                `http://localhost:3000/api/user/${userId}/plans/generate?majorId=${selectedMajorId}&startSemesterId=${selectedSemesterId}`,
                { headers: { Authorization: `bearer ${userToken}` } }
            );

            if (!res.ok) throw "error";
            const degreePlan = await res.json();

            setSelectedPlan({
                id: null,
                name: "Unnamed Plan",
                userId,
                majorId: parseInt(selectedMajorId),
                startSemesterId: parseInt(selectedSemesterId),
                plan: degreePlan,
            });

            setShowGenerateForm.off();
            setPlanHasChanged(true);
        } catch (e) {
            commonToast({
                title: "Something went wrong",
                status: "error",
                ...commonToastOptions,
            });
        }
    }

    function sidePanelSelectPlan(plan) {
        setSelectedPlan(plan);
        setSelectedPlanUnchanged(JSON.parse(JSON.stringify(plan)));
    }

    async function savePlan() {
        const { id, ...plan } = selectedPlan;
        const options = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `bearer ${userToken}`,
            },
        };

        let res;
        if (selectedPlan.id) {
            // Pre-existing plan
            res = await fetch(
                `http://localhost:3000/api/user/${userId}/plans/${id}`,
                { method: "PUT", body: JSON.stringify(plan), ...options }
            );

            if (res.ok) {
                setUserPlans((prev) =>
                    prev.map((plan) =>
                        plan.id === selectedPlan.id ? selectedPlan : plan
                    )
                );
                setSelectedPlanUnchanged(JSON.parse(JSON.stringify(selectedPlan)));
            }
        } else {
            // Newly generated plan
            options.method = "POST";

            userPlans.length ? (plan.mainPlan = false) : (plan.mainPlan = true);
            options.body = JSON.stringify(plan);

            res = await fetch(`http://localhost:3000/api/user/${userId}/plans`, {
                body: JSON.stringify(plan),
                ...options,
            });
            const savedPlan = await res.json(); // API returns the created user plan

            if (res.ok) {
                setUserPlans((prev) => [...prev, savedPlan]);
                setSelectedPlan(savedPlan);
                setSelectedPlanUnchanged(JSON.parse(JSON.stringify(savedPlan)));
            }
        }

        if (res.ok) {
            setPlanHasChanged(false);
            commonToast({
                title: "Plan saved",
                status: "success",
                ...commonToastOptions,
            });
        } else
            commonToast({
                title: "Something went wrong",
                status: "error",
                ...commonToastOptions,
            });
    }

    async function handleDeletePlan() {
        setShowDelPlanAlert.off();

        const res = await fetch(
            `http://localhost:3000/api/user/${userId}/plans/${selectedPlan.id}`,
            {
                method: "DELETE",
                headers: { Authorization: `bearer ${userToken}` },
            }
        );
        if (res.ok) {
            setUserPlans((prev) => {
                const updatedUserPlans = prev.filter(
                    (plan) => plan.id !== selectedPlan.id
                );
                setMainPlanAsSelected(updatedUserPlans);
                return updatedUserPlans;
            });
            commonToast({
                title: "Plan deleted",
                status: "success",
                ...commonToastOptions,
            });
        } else
            commonToast({
                title: "Something went wrong",
                status: "error",
                ...commonToastOptions,
            });
    }

    async function handleSetMainPlan() {
        const res = await fetch(
            `http://localhost:3000/api/user/${userId}/plans/main-plan`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `bearer ${userToken}`,
                },
                method: "PUT",
                body: JSON.stringify({ planId: selectedPlan.id }),
            }
        );

        if (res.ok) {
            setUserPlans((prev) =>
                prev.map((plan) => {
                    plan.mainPlan = plan.id == selectedPlan.id ? true : false;
                    return plan;
                })
            );
            commonToast({
                title: `${selectedPlan.name} set as main plan`,
                status: "success",
                ...commonToastOptions,
            });
        } else
            commonToast({
                title: "Something went wrong",
                status: "error",
                ...commonToastOptions,
            });
    }

    async function handleExportPlan() {
        const planElement = document.querySelector("#degree-plan");
        const blob = await toBlob(planElement);
        saveAs(blob, "degree_plan");
    }

    async function handlePackageCourseSelect(course) {
        selectedPlanCourse.courseId = course.id;
        selectedPlanCourse.course = course;
        setPlanHasChanged(true);
        onClosePkgModal();
    }

    function handleAddYear() {
        setSelectedPlan((prev) => {
            const tempPlan = JSON.parse(JSON.stringify(prev));
            const newYear = [];
            for (const sem of prev.plan[0]) {
                newYear.push({ ...sem, courses: [] });
            }

            tempPlan.plan.push(newYear);
            return tempPlan;
        });
    }

    return (
        <>
            <CommonHead title={'DP - Degree Plan'} name={'description'}
                        content={'Generate a default degree plan and edit it as you wish, ' +
                            'giving you both the freedom and control to plan out your degree the way you like.'}
                        iconLoc={'/logo.ico'}/>

            <main className={styles.main} style={{ paddingTop: 0 }} >
                <GeneratePlanForm
                    showAlert={showGenerateForm}
                    setShowAlert={setShowGenerateForm}
                    existingPlans={userPlans.length > 0 ? true : false}
                    generatePlanFn={generateNewStudyPlan}
                />

                {selectedPlan && (
                    <>
                        <Flex direction={"column"}>
                            <HStack justifyContent={"center"}>
                                <PlanActionMenu
                                    planName={selectedPlan.name}
                                    handleAdd={onOpenAddModal}
                                    handleRename={onOpenRenameModal}
                                    handleMainPlan={handleSetMainPlan}
                                    handleExportPlan={handleExportPlan}
                                    handleDelete={setShowDelPlanAlert.on}
                                />

                                {planHasChanged && (
                                    <>
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
                                            onClick={savePlan}
                                            icon={<MdSave />}
                                        />
                                        <IconButton
                                            variant="outline"
                                            size={"sm"}
                                            onClick={setShowDiscardAlert.on}
                                            icon={<MdClose />}
                                        />
                                    </>
                                )}
                            </HStack>

                            <Divider borderColor={"blackAlpha.800"} />

                            <AddCourseModal
                                isOpen={isOpenAddModal}
                                onClose={onCloseAddModal}
                            />

                            <RenamePlanModal
                                isOpen={isOpenRenameModal}
                                onClose={onCloseRenameModal}
                                selectedPlan={selectedPlan}
                                onClick={(newName) => {
                                    setPlanHasChanged(true);
                                    setSelectedPlan({ ...selectedPlan, name: newName });
                                    onCloseRenameModal();
                                }}
                            />

                            <CommonAlert
                                isOpen={showDelPlanAlert}
                                onClose={setShowDelPlanAlert.off}
                                type={"delete"}
                                planName={selectedPlan.name}
                                handleFn={handleDeletePlan}
                            />

                            <CommonAlert
                                isOpen={showDiscardAlert}
                                onClose={setShowDiscardAlert.off}
                                type={"discard"}
                                handleFn={() => {
                                    setSelectedPlan(
                                        JSON.parse(JSON.stringify(selectedPlanUnchanged))
                                    );
                                    setPlanHasChanged(false);
                                    setShowDiscardAlert.off();
                                    if (!selectedPlanUnchanged) setShowGenerateForm.on();
                                }}
                            />

                            <CommonAlert
                                isOpen={showUnsavedAlert}
                                onClose={setShowUnsavedAlert.off}
                                type={"unsaved"}
                            />
                        </Flex>

                        <Flex>
                            <SidePanel
                                plans={userPlans}
                                currentPlanHasChanges={planHasChanged}
                                setShowUnsavedAlert={setShowUnsavedAlert}
                                selectedPlan={selectedPlan}
                                sidePanelSelectPlan={sidePanelSelectPlan}
                                triggerGenerate={() => setShowGenerateForm.on()}
                            />

                            <Flex
                                id="degree-plan"
                                gap={10}
                                justify="space-between"
                                flexGrow={1}
                                align-items="center"
                                overflowX={"scroll"}
                            >
                                <Flex />
                                {selectedPlan.plan.map((yearData, index) => (
                                    <YearCard
                                        key={index}
                                        data={yearData}
                                        yearIndex={index}
                                        selectedPlan={selectedPlan}
                                        setPlanHasChanged={setPlanHasChanged}
                                        setSelectedPlan={setSelectedPlan}
                                        setSelectedPlanCourse={setSelectedPlanCourse}
                                        onOpenInfoModal={onOpenInfoModal}
                                        onOpenPkgModal={onOpenPkgModal}
                                    />
                                ))}

                                <IconButton
                                    height={"90%"}
                                    my={"auto"}
                                    icon={<MdAdd />}
                                    onClick={handleAddYear}
                                />
                            </Flex>
                        </Flex>

                        {selectedPlanCourse && (
                            <>
                                {selectedPlanCourse.packageId ? (
                                    <PackageCourseSelector
                                        isOpen={isOpenPkgModal}
                                        onClose={onClosePkgModal}
                                        selectedPlanCourse={selectedPlanCourse}
                                        onSelect={handlePackageCourseSelect}
                                    />
                                ) : (
                                    <CourseInfo
                                        isOpen={isOpenInfoModal}
                                        onClose={onCloseInfoModal}
                                        selectedPlanCourse={selectedPlanCourse}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
            </main>
        </>
    );
}

function RenamePlanModal({ isOpen, onClose, selectedPlan, onClick }) {
    const [value, setValue] = useState(selectedPlan.name);

    useEffect(() => {
        setValue(selectedPlan.name);
    }, [selectedPlan]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Rename plan</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <HStack p={2}>
                        <Input
                            size="lg"
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                        />
                        <Button onClick={() => onClick(value)}>Confirm</Button>
                    </HStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
