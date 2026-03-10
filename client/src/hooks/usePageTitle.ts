import { useEffect } from "react";

const APP_NAME = "Community Platform";

/**
 * Sets the browser document title for client-side pages.
 * Appends the app name: "Feed | Community Platform"
 */
export function usePageTitle(title: string) {
    useEffect(() => {
        document.title = `${title} | ${APP_NAME}`;
        return () => {
            document.title = APP_NAME;
        };
    }, [title]);
}
