import { TriangleDownIcon } from '@chakra-ui/icons';
import {
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Button
} from "@chakra-ui/react";
import { MdDelete, MdDriveFileRenameOutline, MdFavorite, MdAddBox, MdSaveAlt } from "react-icons/md";

export default function PlanActionMenu({ planName, handleAdd, handleRename, handleMainPlan, handleExportPlan, handleDelete }) {
    const commonMenuItemStyle = {
        // this will style the MenuItem and MenuItemOption components
        color: 'gray.600',
        _hover: { bg: 'maroon.600' },
        _focus: { bg: 'blue.100' },
        fontWeight: 600,
        fontSize: '1.1rem',
    }

    return (
        <Menu matchWidth={true}>
            <MenuButton
                as={Button} size='lg'
                variant='ghost'
                px={4} py={2}
                transition='all 0.2s'
            >
                {planName} <TriangleDownIcon />
            </MenuButton>
            <MenuList
                sx={{
                    py: '4',
                    borderRadius: 'xl',
                    border: '1px gray.800',
                }}
            >
                <MenuItem
                    icon={<MdAddBox />}
                    sx={commonMenuItemStyle}
                    onClick={handleAdd}
                >
                    Add course
                </MenuItem>
                <MenuItem
                    icon={<MdDriveFileRenameOutline />}
                    sx={commonMenuItemStyle}
                    onClick={handleRename}
                >
                    Rename plan
                </MenuItem>
                <MenuItem
                    icon={<MdFavorite />}
                    sx={commonMenuItemStyle}
                    onClick={handleMainPlan}
                >
                    Set as main plan
                </MenuItem>

                <MenuItem
                    icon={<MdSaveAlt />}
                    sx={commonMenuItemStyle}
                    onClick={handleExportPlan}
                >
                    Export as image
                </MenuItem>

                <MenuDivider />

                <MenuItem
                    icon={<MdDelete />}
                    sx={{
                        ...commonMenuItemStyle,
                        color: 'red.600'
                    }}
                    onClick={handleDelete}
                >
                    Delete plan
                </MenuItem>
            </MenuList>
        </Menu>
    )
}