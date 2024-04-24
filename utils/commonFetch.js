import {useEffect, useRef, useState} from "react";
import {getCookie} from "../pages/api/util/getCookie";

export function useData(url) {
    const [data, setData] = useState(null);
    //let optionsWithAuth = useRef(options)
    useEffect(() => {
        if (url) {
            let userToken = ''
            if (typeof window !== undefined) {
                userToken = getCookie({}, "userSession").userToken
            }
            // if (options && !options?.headers) {
            //     optionsWithAuth.current = {...options, headers: {'Authorization': `bearer ${userToken}`}};
            // } else optionsWithAuth.current = {
            //     ...options,
            //     headers: {
            //         ...options?.headers,
            //         'Authorization': `bearer ${userToken}`
            //     }
            // }
            let ignore = false;
            fetch(url, {headers: {'Authorization': `bearer ${userToken}`}})
                .then(response => response.json())
                .then(json => {
                    if (!ignore) {
                        setData(json);
                    }
                });
            return () => {
                ignore = true;
            };
        }
    }, [url]);
    return data;
}