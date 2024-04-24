import {
    Card,
    CardBody,
    CardHeader,
    Flex,
    HStack,
    Text,
    Input,
    IconButton,
    Divider,
    Box,
    Checkbox, Icon, Tooltip
} from "@chakra-ui/react";
import {MdAdd, MdDelete, MdVisibility, MdVisibilityOff} from "react-icons/md";
import {useEffect, useState} from "react";
import {getCookie} from "../../pages/api/util/getCookie";

export default function TodosCard({userId}) {
    const [showAll, setShowAll] = useState(true)
    const [todos, setTodos] = useState([])
    const [todo, setTodo] = useState({userId: userId, title: '', completed: false})

    useEffect(() => {
        const {userToken} = getCookie({}, "userSession");
        const options = {
            headers: {
                Authorization: `bearer ${userToken}`,
            }
        };
        fetch(`http://localhost:3000/api/user/${userId}/todos`, options)
            .then((r) => r.json())
            .then((data) => setTodos(data.sort((a, b) => a.completed - b.completed)))
    }, [])

    function addTodo() {
        if (todo.title.trim() === '')
            return

        delete todo.id
        fetch(`http://localhost:3000/api/user/${userId}/todos`,
            fetchOptions('POST', JSON.stringify(todo))).then(r => r.json())
            .then((todoId) => {
                setTodos(prevState => [{...todo, id: todoId}, ...prevState])
            })
        setTodo({...todo, title: ''})
    }

    function updateTodo(todoId) {

        let updatedTodo = {}
        const updatedTodos = todos.map((todo) => {
            if (todo.id === todoId) {
                todo.completed = !todo.completed
                updatedTodo = todo
                return todo
            } else return todo
        })
        fetch(`http://localhost:3000/api/user/${userId}/todos`,
            fetchOptions('PUT', JSON.stringify(updatedTodo))).then(r => r.ok)
        setTodos(updatedTodos.sort((a, b) => a.completed - b.completed))
    }

    function deleteTodo(todo) {
        setTodos(todos.filter((currentTodo) => currentTodo.id !== todo.id))
        fetch(`http://localhost:3000/api/user/${userId}/todos`,
            fetchOptions('DELETE', JSON.stringify(todo))).then(r => r.ok)
    }

    function fetchOptions(requestMethod, body = undefined) {
        const {userToken} = getCookie({}, "userSession");
        const options = {
            headers: {
                Authorization: `bearer ${userToken}`
            }
        }
        switch (requestMethod.toUpperCase()) {
            case 'GET':
                return options
            case 'POST':
                options.method = 'POST'
                options.body = body
                options.headers['Content-Type'] = "application/json"
                return options
            case 'PUT':
                options.method = 'PUT'
                options.body = body
                options.headers['Content-Type'] = "application/json"
                return options
            case 'DELETE':
                options.method = 'DELETE'
                options.body = body
                options.headers['Content-Type'] = "application/json"
                return options
        }
    }

    return (<>
            <Card p={4} sx={{bgColor: 'gray.50'}}>
                <CardHeader p={1.5}>
                    <Flex justifyContent='space-between' px={2}>
                        <Text fontSize={'xl'} fontFamily={'sans-serif'} fontWeight={'bold'}>Todo</Text>

                        <Tooltip placement='top'
                                 label={showAll ? 'show all todos' : 'show pending todos'}
                                 aria-label={showAll ? 'show all todos' : 'show pending todos'}>
                            <IconButton
                                size={'sm'}
                                my={"auto"}
                                icon={showAll ? <MdVisibility/> : <MdVisibilityOff/>}
                                onClick={() => {
                                    setShowAll(!showAll)
                                }}
                            />
                        </Tooltip>
                    </Flex>
                    <Divider mt={2} borderColor={'black'}/>
                </CardHeader>
                <CardBody width={'300px'} height={'100%'}>
                    <HStack height={'5%'} mb={4} justifyContent={'space-between'}>
                        <Input size={'sm'} width={'80%'} value={todo.title}
                               placeholder='add todo' sx={{bgColor: 'white'}}
                               onChange={(e) =>
                                   setTodo({...todo, title: e.target.value})
                               }></Input>
                        <IconButton
                            variant='outline'
                            size={'sm'}
                            my={"auto"}
                            colorScheme='teal'
                            isDisabled={todo.title.trim() === ''}
                            icon={<MdAdd/>}
                            onClick={() => {
                                addTodo()
                            }}
                            aria-label='add todo'
                        />
                    </HStack>
                    <Divider borderColor={'gray.100'}/>
                    <Box px={2} height={'75%'} sx={{overflowY: 'auto'}} mt={3}>
                        <Box>
                            {todos.map((todo, index) => (showAll ? showAll : !todo.completed) &&
                                <TodoCard key={index} todo={todo} index={index} updateTodo={() => updateTodo(todo.id)}
                                          deleteTodo={() => deleteTodo(todo)}/>)}
                        </Box>
                    </Box>
                </CardBody>
            </Card>
        </>
    )
}

function TodoCard(
    {
        todo, index, updateTodo, deleteTodo
    }
) {

    return (
        <Card mt={2} mb={2} p={2}>
            <Flex justifyContent={'space-between'}>
                <Text as={todo.completed ? 's' : ''}>{todo.title}</Text>
                <Flex width='50px' justifyContent='space-between'>
                    <Checkbox isChecked={todo.completed} value={todo.completed} aria-label='check a todo'
                              onChange={(e) => {
                                  updateTodo(todo.id)
                              }}></Checkbox>
                    <IconButton
                        size={'xs'}
                        my={"auto"}
                        variant={'ghost'}
                        _hover={{bg: "red.200"}}
                        icon={<MdDelete/>}
                        onClick={() => {
                            deleteTodo(todo)
                        }}
                        aria-label='delete todo'/>
                </Flex>
            </Flex>
        </Card>
    )
}