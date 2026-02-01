import {useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {Flex, Loader, Text} from '@gravity-ui/uikit';
import {createSessionFromUrl} from '../utils/sessionStorage';
import {loadStateFromUrl} from '../utils/urlState';

/**
 * Component that handles share URLs with data/config params.
 * Creates a new session from URL params and redirects to the editor.
 */
export function ShareRedirect() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Check if we have share URL params
        const urlState = loadStateFromUrl();

        if (urlState.data && urlState.config) {
            // Create a new session from URL data
            const session = createSessionFromUrl();

            if (session) {
                // Redirect to the new session
                navigate(`/editor/${session.id}`, {replace: true});
                return;
            }
        }

        // No valid share data, redirect to editor home
        navigate('/editor', {replace: true});
    }, [navigate, searchParams]);

    return (
        <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{height: '100%', gap: '16px'}}
        >
            <Loader size="l" />
            <Text variant="body-1" color="secondary">
                Loading shared chart...
            </Text>
        </Flex>
    );
}
