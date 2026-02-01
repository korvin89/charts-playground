import {AsideHeader} from '@gravity-ui/navigation';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAppDispatch} from '../../store/hooks';
import {setConfig, setData} from '../../store/slices/editorSlice';
import {templates} from '../../templates';

export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();

    const handleItemClick = (
        _id: string,
        path?: string,
        templateData?: string,
        templateConfig?: string,
    ) => {
        if (templateData && templateConfig) {
            dispatch(setData(templateData));
            dispatch(setConfig(templateConfig));
        }
        if (path) {
            navigate(path, {state: {fromTemplates: true}});
        }
    };

    const menuItems = [
        {
            id: 'home',
            title: 'Home',
            current: location.pathname === '/',
            onItemClick: () => handleItemClick('home', '/'),
        },
        {
            id: 'templates',
            title: 'Templates',
            current: location.pathname === '/templates',
            onItemClick: () => handleItemClick('templates', '/templates'),
            items: templates.map((template) => ({
                id: template.id,
                title: template.name,
                onItemClick: () =>
                    handleItemClick(template.id, '/sandbox', template.data, template.config),
            })),
        },
        {
            id: 'sandbox',
            title: 'Sandbox',
            current: location.pathname === '/sandbox',
            onItemClick: () => handleItemClick('sandbox', '/sandbox'),
        },
    ];

    return (
        <AsideHeader
            logo={{
                text: 'Charts Sandbox',
                iconSrc: undefined,
            }}
            menuItems={menuItems}
            compact={false}
        />
    );
}
