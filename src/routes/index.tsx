import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {AppLayout} from '../layouts/AppLayout';
import {HomePage} from '../pages/HomePage';
import {EditorHomePage} from '../pages/EditorHomePage';
import {EditorPage} from '../pages/EditorPage';
import {ShareRedirect} from '../pages/ShareRedirect';

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="editor" element={<EditorHomePage />} />
                    <Route path="editor/share" element={<ShareRedirect />} />
                    <Route path="editor/:sessionId" element={<EditorPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
