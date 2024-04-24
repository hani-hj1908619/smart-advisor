import {AddIcon, SearchIcon} from "@chakra-ui/icons";
import {
    Box,
    Button,
    Card,
    Center,
    Divider,
    FormControl,
    FormLabel,
    HStack,
    Heading,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    SimpleGrid,
    Spinner,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    VStack,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import AddReviewModal from "components/reviews/AddReviewModal";
import ReviewCard from "components/reviews/ReviewCard.js";
import SearchReviewModal from "../../components/reviews/SearchReviewModal";
import Head from "next/head";
import {useEffect, useRef, useState} from "react";
import styles from "styles/Home.module.css";
import {calculateReviewOVR} from "../../utils/reviewsFunctions";
import {withSessionSsr} from "../../utils/withSession";
import {getCookie} from "../api/util/getCookie";
import {verifyToken} from "../api/util/verifyToken";
import CommonHead from "../../components/common/CommonHead";

export const getServerSideProps = withSessionSsr(
    async function getServerSideProps({req}) {
        const cookie = getCookie({req}, "userSession");
        const userToken = cookie?.userToken
        if (!req.session.user || verifyToken(userToken) == null) {
            return {
                redirect: {
                    destination: "/loginuser",
                    permanent: false,
                },
            };
        }
        const {id: userId} = req.session.user;

        let res = await fetch("http://localhost:3000/api/reviews", {
            headers: {Authorization: `bearer ${userToken}`},
        });
        const reviewsData = await res.json();

        return {
            props: {reviewsData, userId, userToken},
        };
    }
);

export default function Reviews({reviewsData, userId, userToken}) {
    // Add review modal
    const {isOpen, onOpen, onClose} = useDisclosure();
    const finalRef = useRef(null);

    const [reviews, setReviews] = useState(reviewsData);
    const [topReviews, setTopReviews] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchTypeClicked, setIsSearchTypeClicked] = useState(false);
    const groupedReviews = useRef([]);

    const {
        isOpen: isOpenSearchModal,
        onOpen: onOpenSearchModal,
        onClose: onCloseSearchModal,
    } = useDisclosure(); // search review modal

    const addReviewToast = useToast();
    const toastOptions = {duration: 2000, isClosable: true};

    const [tabIndex, setTabIndex] = useState(0);
    const [userReviews, setUserReviews] = useState(false);
    const [userReviewsFiltered, setUserReviewsFiltered] = useState(userReviews);
    const [reviewTypeFilter, setReviewTypeFilter] = useState("all");
    const [userCourseAndInstructorHistory, setUserCourseAndInstructorHistory] =
        useState({
            pastCourses: [],
            pastInstructors: [],
        });

    useEffect(() => {
        groupedReviews.current = [];
        reviews.forEach((review) => {
            if (review.course) {
                const courseCode = review.course.code;
                if (!groupedReviews.current[courseCode])
                    groupedReviews.current[courseCode] = review;
            } else {
                const instructor = review.instructor.name;
                if (!groupedReviews.current[instructor])
                    groupedReviews.current[instructor] = review;
            }
        });
        groupedReviews.current = Object.values(groupedReviews.current);
    }, [reviews]);

    useEffect(() => {
        if (tabIndex === 1) {
            if (!userReviews) {
                let tempUserReviews = [];

                fetch(`http://localhost:3000/api/reviews?userId=${userId}`, {
                    headers: {Authorization: `bearer ${userToken}`},
                })
                    .then((response) => response.json())
                    .then((data) => {
                        tempUserReviews = data;
                        setUserReviews(data);
                    });

                // Populate the instructors/courses dropdown for add review
                fetch(`http://localhost:3000/api/user/${userId}/grades`, {
                    headers: {Authorization: `bearer ${userToken}`},
                })
                    .then((response) => response.json())
                    .then((data) => {
                        const temp = {pastCourses: [], pastInstructors: []};
                        for (const course of data) {
                            const termCourse = course.termCourse;
                            // Check if course is not already in pastCourses
                            if (
                                !temp.pastCourses.find((c) => c.id === termCourse.course.id)
                            ) {
                                // Add attribute to mark existing review
                                if (
                                    tempUserReviews.find(
                                        (r) => r.courseId == termCourse.course.id
                                    )
                                )
                                    termCourse.course.existingReview = true;

                                temp.pastCourses.push(termCourse.course);
                            }

                            // Check if instructor is not already in pastInstructors
                            if (
                                !temp.pastInstructors.find(
                                    (i) => i.id === termCourse.instructor.id
                                )
                            ) {
                                // Add attribute to mark existing review
                                if (
                                    tempUserReviews.find(
                                        (r) => r.instructorId == termCourse.instructor.id
                                    )
                                )
                                    termCourse.instructor.existingReview = true;

                                temp.pastInstructors.push(termCourse.instructor);
                            }
                        }
                        temp.pastCourses.sort((a, b) => a.title.localeCompare(b.title));
                        temp.pastInstructors.sort((a, b) => a.name.localeCompare(b.name));

                        setUserCourseAndInstructorHistory(temp);
                    });
            }
        }
    }, [tabIndex, userReviews, userCourseAndInstructorHistory]);

    useEffect(() => {
        if (reviewTypeFilter == "all") setUserReviewsFiltered(userReviews);
        else if (reviewTypeFilter == "instructor")
            setUserReviewsFiltered(userReviews.filter((r) => r.instructorId));
        else setUserReviewsFiltered(userReviews.filter((r) => !r.instructorId));
    }, [userReviews, reviewTypeFilter]);

    async function handleSubmit(review) {
        review.userId = userId;

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `bearer ${userToken}`,
            },
            body: JSON.stringify(review),
        };
        const res = await fetch(`http://localhost:3000/api/reviews`, options);

        if (res.ok) {
            if (review.courseId) {
                const course = userCourseAndInstructorHistory.pastCourses.find(
                    (c) => c.id == review.courseId
                );
                course.existingReview = true;
                review.course = course;
            } else if (review.instructorId) {
                const instructor = userCourseAndInstructorHistory.pastInstructors.find(
                    (i) => i.id == review.instructorId
                );
                instructor.existingReview = true;
                review.instructor = instructor;
            }

            setReviews((cur) => [...cur, review]);
            setUserReviews((cur) => [...cur, review]);
            addReviewToast({
                title: "Review added",
                status: "success",
                ...toastOptions,
            });
        } else {
            addReviewToast({
                title: "Something went wrong",
                status: "error",
                ...toastOptions,
            });
        }
    }

    useEffect(() => {
        const topRanked = [];
        for (let i = 0; i < reviews.length; i++) {
            const ovr = calculateReviewOVR(reviews[i]);
            if (parseFloat(ovr) >= 3.5) topRanked.push(reviews[i]);
        }
        setTopReviews(topRanked);
    }, [reviews]);

    return (
        <>
            <CommonHead title={'DP - Reviews'} name={'description'}
                        content={'Search reviews made by other students and add your own,' +
                            ' ensuring that you and other students always make informed decisions throughout your degree journey'}
                        iconLoc={'/logo.ico'}/>

            <main className={styles.main} key={1}>
                <Tabs
                    isLazy
                    isFitted
                    colorScheme="pink"
                    variant="enclosed-colored"
                    index={tabIndex}
                    onChange={(index) => setTabIndex(index)}
                >
                    <TabList mb="1em">
                        <Tab>All Reviews</Tab>
                        <Tab>My Reviews</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Stack>
                                <Center mt="2%" flexDirection="column" mb="2%">
                                    <Heading fontSize="xx-large">Search Reviews</Heading>
                                    <InputGroup width="auto" mt="2%">
                                        <InputLeftElement pointerEvents="none">
                                            <SearchIcon color="gray.300"/>
                                        </InputLeftElement>
                                        <Input
                                            width="30rem"
                                            placeholder={"Search"}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onClick={() => onOpenSearchModal()}
                                        />
                                    </InputGroup>

                                    {isOpenSearchModal && (
                                        <SearchReviewModal
                                            isOpen={isOpenSearchModal}
                                            modalOnClose={onCloseSearchModal}
                                            groupedReviews={groupedReviews}
                                        />
                                    )}
                                </Center>
                                <Divider/>
                                <Box>
                                    <Heading fontSize="xl">Recent Reviews</Heading>
                                    {reviews.length === 0 ? (
                                        <Center>
                                            <Text mt="5%">No reviews yet. Be the first to add! </Text>
                                        </Center>
                                    ) : (
                                        <Box mt="2%" sx={{overflowX: "auto"}}>
                                            <HStack
                                                alignItems="baseline"
                                                spacing={5}
                                                wrap="nowrap"
                                                sx={{width: "fit-content"}}
                                            >
                                                {reviews.map((review, index) => (
                                                    <ReviewCard
                                                        key={index}
                                                        review={review}
                                                        height="10rem"
                                                    />
                                                ))}
                                            </HStack>
                                        </Box>
                                    )}

                                    <Heading fontSize="xl" mt="2%">
                                        Top Reviews
                                    </Heading>
                                    {topReviews.length === 0 ? (
                                        <Center>
                                            <Text mt="5%">No reviews yet. Be the first to add! </Text>
                                        </Center>
                                    ) : (
                                        <Box mt="2%" sx={{overflowX: "auto"}}>
                                            <HStack
                                                alignItems="baseline"
                                                spacing={5}
                                                wrap="nowrap"
                                                sx={{width: "fit-content"}}
                                            >
                                                {topReviews.map((review, index) => (
                                                    <ReviewCard
                                                        key={index}
                                                        review={review}
                                                        height="10rem"
                                                    />
                                                ))}
                                            </HStack>
                                        </Box>
                                    )}
                                </Box>
                            </Stack>
                        </TabPanel>
                        <TabPanel>
                            {!userReviews ? (
                                <Center h="100%" color="white">
                                    <Spinner
                                        thickness="3px"
                                        speed="0.65s"
                                        emptyColor="gray.200"
                                        color="orange.500"
                                        size="lg"
                                    />
                                </Center>
                            ) : (
                                <>
                                    <AddReviewModal
                                        data={userCourseAndInstructorHistory}
                                        isOpen={isOpen}
                                        onClose={onClose}
                                        finalFocusRef={finalRef}
                                        handleSubmit={handleSubmit}
                                    />

                                    {!userReviews.length ? (
                                        <>
                                            <VStack>
                                                <Text mt="5%">
                                                    You&apos;ve not added any reviews yet. Add one now!
                                                </Text>
                                                <Button
                                                    colorScheme="gray"
                                                    leftIcon={<AddIcon/>}
                                                    onClick={onOpen}
                                                >
                                                    Add review
                                                </Button>
                                            </VStack>
                                        </>
                                    ) : (
                                        <>
                                            <HStack w="100%" mb={2} justifyContent={"space-between"}>
                                                <Text
                                                    fontFamily={"sans-serif"}
                                                    as="b"
                                                    color="gray.600"
                                                    fontSize="lg"
                                                >
                                                    {userReviews ? userReviews.length : 0} total reviews
                                                </Text>

                                                <Button
                                                    colorScheme="gray"
                                                    size={"sm"}
                                                    leftIcon={<AddIcon/>}
                                                    onClick={onOpen}
                                                >
                                                    Add review
                                                </Button>
                                            </HStack>

                                            <Box>
                                                <Card
                                                    p={4}
                                                    height="80vh"
                                                    variant="outline"
                                                    sx={{bgColor: "rgba(160, 174, 192, 0.02)"}}
                                                >
                                                    <HStack
                                                        spacing={2}
                                                        pt={2}
                                                        pb={2}
                                                        my="0.5%"
                                                        justifyContent={"space-between"}
                                                    >
                                                        <form>
                                                            <Box
                                                                width="100%"
                                                                mr={20}
                                                                display="flex"
                                                                direction="row"
                                                                justifyContent="space-between"
                                                            >
                                                                <FormControl>
                                                                    <FormLabel>Review type</FormLabel>
                                                                    <Select
                                                                        size="sm"
                                                                        width="15rem"
                                                                        defaultValue={"all"}
                                                                        onChange={(e) =>
                                                                            setReviewTypeFilter(e.target.value)
                                                                        }
                                                                    >
                                                                        <option value="all">All</option>
                                                                        <option value="instructor">
                                                                            Instructor
                                                                        </option>
                                                                        <option value="course">Course</option>
                                                                    </Select>
                                                                </FormControl>
                                                                <FormControl>
                                                                    <FormLabel>Sort rating by</FormLabel>
                                                                    <Select
                                                                        placeholder="Sort rating by"
                                                                        size="sm"
                                                                        width="15rem"
                                                                    >
                                                                        <option value="High - Low">
                                                                            High - Low
                                                                        </option>
                                                                        <option value="Low - High">
                                                                            Low - High
                                                                        </option>
                                                                    </Select>
                                                                </FormControl>
                                                            </Box>
                                                        </form>
                                                    </HStack>
                                                    <Divider my={1}/>
                                                    <SimpleGrid spacing={8} minChildWidth="25em">
                                                        {userReviewsFiltered &&
                                                            userReviewsFiltered.map((review, index) => (
                                                                <ReviewCard key={index} review={review}/>
                                                            ))}
                                                    </SimpleGrid>
                                                </Card>
                                            </Box>
                                        </>
                                    )}
                                </>
                            )}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </main>
        </>
    );
}