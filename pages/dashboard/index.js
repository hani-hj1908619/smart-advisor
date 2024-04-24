import { Flex } from "@chakra-ui/react";
import Head from "next/head";
import DashTimetable from "../../components/dashboard/DashTimetable";
import KeyEventsCard from "../../components/dashboard/KeyEventsCard";
import ProgressCard from "../../components/dashboard/ProgressCard";
import TodosCard from "../../components/dashboard/TodosCard";
import UpcomingSemCard from "../../components/dashboard/UpcomingSemCard";
import styles from "../../styles/Home.module.css";
import { withSessionSsr } from "../../utils/withSession";
import { getCookie } from "../api/util/getCookie";
import { verifyToken } from "../api/util/verifyToken";
import CommonHead from "../../components/common/CommonHead";

export const getServerSideProps = withSessionSsr(
    async function getServerSideProps({ req }) {
        const cookie = getCookie({ req }, "userSession"), userToken = cookie?.userToken;
        if (!req.session.user || verifyToken(userToken) == null) {
            return {
                redirect: {
                    destination: "/loginuser",
                    permanent: false,
                },
            };
        }

        const { id: userId, gender: gender, joinYear: joinYear } = req.session.user;
        let res

        // Get main plan
        res = await fetch(
            `http://localhost:3000/api/user/${userId}/plans/main-plan`,
            { headers: { Authorization: `bearer ${userToken}` } }
        );
        res = await res.json();
        const mainPlan = res ? res.plan : null

        // Get saved user sem schedule if any
        res = await fetch(
            `http://localhost:3000/api/user/${userId}/schedule?joinYear=${joinYear}`,
            { headers: { Authorization: `bearer ${userToken}` } }
        );
        res = await res.json();
        const { schedule } = res

        return {
            props: { schedule, mainPlan, userId },
        };
    }
);

export default function Dashboard({ schedule, mainPlan, userId }) {
    return (
        <>
            <CommonHead title={'DP - Dashboard'} name={'description'}
                        content={'Quick summary of the application, upcoming courses, todos and timetable'}
                        iconLoc={'/logo.ico'}/>

            <main className={styles.main}>
                <Flex justifyContent={'space-between'} height={'340px'}>
                    <ProgressCard userId={userId} mainPlan={mainPlan} />
                    <UpcomingSemCard plan={mainPlan} />
                    <KeyEventsCard />

                    <TodosCard userId={userId} />
                </Flex>
                <DashTimetable height={'40%'} schedule={schedule} />
            </main>
        </>
    );
}
