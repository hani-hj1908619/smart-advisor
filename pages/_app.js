import "../styles/globals.css";
import Layout from "../components/common/layout";

import {ChakraProvider} from "@chakra-ui/react";
import {useRouter} from "next/router";
import {NextUIProvider} from '@nextui-org/react';

export default function App({Component, pageProps}) {
    const router = useRouter();
    const showHeader = (!(router.pathname === "/login" || router.pathname === "/" || router.pathname === "/signup" ||
        router.pathname === "/loginuser"  || router.pathname === '/download'));
    return (
        <NextUIProvider>
            <ChakraProvider>
                {showHeader && <Layout/>}
                <Component {...pageProps} />
            </ChakraProvider>
        </NextUIProvider>
    );
}
