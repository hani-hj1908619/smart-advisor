import Head from "next/head";
import styles from "../styles/Home.module.css";
import HomeNavBar from "../components/home/HomeNavBar";
import {Flex, Text, Heading, Center, Box, Image, useMediaQuery} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Pagination } from '@nextui-org/react';
import PaginationPromo from "../components/home/PaginationPromo";
import FeaturesPromo from "../components/home/FeaturesPromo";
import CommonHead from "../components/common/CommonHead";



export default function Home() {
    const pagTitles = [
        'Take Control of Your Academic Future Today',
        'Streamline Course Planning',
        'Maximize your college experience with informed decisions',
        'Your Course Plan, Anywhere You Go']

    const pagTextBodies = [
        ' Create your perfect schedule and achieve your dreams with our app.',
        'Say goodbye to academic stress and hello to a clear course plan with our app.',
        'Stay Ahead of the Game with Our App\'s Course and Instructor Ratings',
        'Stay connected to your degree plan anywhere, anytime']

    const featureTextBodies = [
        'Enabling students to tailor their college experience to their unique goals' +
        'and preferences. With our intuitive interface, students can effortlessly create' +
        'multiple plans and edit them. Say goodbye to the stress of degree planning and hello' +
        'to a personalized and streamlined path to graduation.',
        'Effortlessly optimize your semester schedule with our intelligent section selection feature. Our app automatically selects sections based on your course preferences, ' +
        'eliminating time conflicts and ensuring a seamless planning experience tailored to your needs.',
        'Streamline your university journey with our powerful course and instructor review feature. Gain insights from fellow students,' +
        ' share feedback, and access the overall review distribution, ' +
        'ensuring you make informed decisions and enjoy a seamless academic experience.']

    const [page, updatePage] = useState(0)
    const [transitionClass, setTransitionClass] = useState(1);
    const [isLargerThan800] = useMediaQuery(['(min-width: 800px)', '(display-mode: browser)'], {
        ssr: true,
        fallback: false, // return false on the server, and re-evaluate on the client side
    })

    const images = [
        'https://s30876.pcdn.co/wp-content/uploads/The-Different-Types-of-Academic-Careers-1170x630.jpg.webp',
        'https://www.organimi.com/wp-content/uploads/2021/02/AdobeStock_241596426-1080x675.jpeg',
        'https://support-my-decision.org.au/wp-content/uploads/2018/08/review-your-decision-general-tips.jpg',
        'https://img.ashampoo.com/ashampoo.com_images/img/1/products/partner0013/sticky-password-icon-ios-android-windows-mac.png']

    useEffect(() => {
        const timer = setTimeout(() => {
            // Code to be executed after 5 seconds
            setTransitionClass(0);

            setTimeout(() => {
                updatePage((page + 1) % 4);
                setTransitionClass(1);
            }, 1000);

        }, 5000);

        return () => clearInterval(timer);
    }, [page]);

    return (<>
        <CommonHead title={'DP - Home'} name={'description'}
                    content={'A planner made for students by students, helps ensure students are on track with their degree journey from admission to graduation.'}
                    iconLoc={'/logo.ico'}/>

        <HomeNavBar>
            <main className={styles.homepageMain} key={1}>
                <Box flexDirection={'column'}>
                    <PaginationPromo
                        isMobile={!isLargerThan800}
                        title={pagTitles[page]}
                        textBody={pagTextBodies[page]}
                        transitionClass={transitionClass}
                        image={images[page]}
                    />

                    <Center width='100%'>
                        <Pagination
                            rounded shadow onlyDots size={'sm'}
                            initialPage={1} page={page + 1}
                            controls={false} total={pagTitles.length}
                            onChange={(page) => updatePage(page - 1)}
                        />
                    </Center>

                </Box>
                <Box p={4}>
                    <Center mt='2%' mb='5%'>
                        <Heading size='xl'>Features</Heading>
                    </Center>
                    <>
                        <FeaturesPromo
                            isMobile={!isLargerThan800}
                            title='Degree plan'
                            description={featureTextBodies[0]}
                            image={'degree-plan.svg'}
                        />

                        <FeaturesPromo
                            isMobile={!isLargerThan800}
                            title='Semester Schedule'
                            description={featureTextBodies[1]}
                            image={'semester-schedule.svg'}
                        />

                        <FeaturesPromo
                            isMobile={!isLargerThan800}
                            title='Reviews'
                            description={featureTextBodies[2]}
                            image={'reviews.svg'}
                        />
                    </>
                </Box>
            </main>
        </HomeNavBar>
    </>)
}