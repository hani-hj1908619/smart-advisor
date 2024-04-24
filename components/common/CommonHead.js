import Head from "next/head";

export default function CommonHead({title, name, content, iconLoc}){

    return (
        <Head>
            <title>{title}</title>
            <meta name={name} content={content} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href={iconLoc} />
        </Head>
    )
}