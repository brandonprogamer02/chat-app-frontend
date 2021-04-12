import React, { useEffect, useReducer, useState } from 'react'
import ViewListaChat from '../ViewListaChat/ViewListaChat'
import ViewChat from '../ViewChat/ViewChat'
import { setTokenLocalStorage } from '../../utils/localStorage';
import { useDispatch, useSelector } from 'react-redux';
import { getUserByToken } from '../../crudMongoDB/user';
import { context, reducer, VIEWS } from './BackgroundReducer';
import { verifyValidToken } from '../../crudMongoDB/auth';
import Login from '../ViewAuth/Login';
import Signin from '../ViewAuth/Signin';
import { State } from '../../redux/types';
import { findUserApi } from '../../redux/actions/userActions/findUserApi';
import { findChatsApi } from '../../redux/actions/chatsAction';
import { findChatApi } from '../../redux/actions/chatActions/findChatApi';
import { deleteChatApi } from '../../crudMongoDB/chat';

const Background = () => {
    const dispatch = useDispatch();
    const chatsState = useSelector((state: State) => state.chats);
    const userState = useSelector((state: State) => state.user);

    const [view, _setView] = useReducer(reducer, VIEWS);
    const [x, reload] = useReducer(x => x + 1, 0);
    const [activeChatId, setActiveChatId] = useState('');
    const [primerFindChat, setPrimerFindChat] = useState(true)

    useEffect(() => {
        (async () => {
            // LOAD INITIAL DATA
            // getting token of local storage
            const token = await setTokenLocalStorage() as string;
            // verify if token is valid
            if (token) {
                const tokenValid = await verifyValidToken(token);
                // if token exists then load the aplication else then load login view
                if (tokenValid) {
                    setView(VIEWS.VIEW_LISTA_CHAT.value);
                    const user = await getUserByToken(token);
                    // console.log(user);
                    if (user) {
                        dispatch(findUserApi(user._id));
                    }
                }
            }
        })();
    }, []);

    useEffect(() => {
        // este efecto es para que cargue los chats despues que cargue el usuario, que el la busqueda de chats depende
        // del usuario
        if (!userState.loading && userState.result.username !== "") dispatch(findChatsApi());
    }, [userState.loading]);

    useEffect(() => {
        // estos es para que cargue por default el primer chat 
        if (!chatsState.loading && chatsState.result.length > 0 && primerFindChat) {
            setPrimerFindChat(false);
            const firstChat = chatsState.result[0]._id as string;
            dispatch(findChatApi(firstChat));
        }
    }, [chatsState.loading]);

    function setView(view: string) {
        _setView(view);
        reload();
    }

    return (
        <context.Provider value={{ setView, activeChatId, setActiveChatId }}>
            {/* {(()=> console.log(view))()} */}
            <div className='container-fluid' style={{ backgroundColor: ' #FCFCFC' }}>
                <div className="row vh-100">
                    {(view.VIEW_LOGIN.display !== '' && view.VIEW_SIGNIN.display !== '') && <>
                        <div className={`col-12 col-md-5 ${view.VIEW_LISTA_CHAT.display}`}>
                            <ViewListaChat />
                        </div>
                        <div className={`col-12 col-md-7 ${view.VIEW_CHAT.display}`} >
                            <ViewChat />
                        </div>
                    </>}
                    <>
                        <div className={`col-12 ${view.VIEW_LOGIN.display} `}>
                            <Login />
                        </div>
                        <div className={`col-12 ${view.VIEW_SIGNIN.display}`}>
                            <Signin />
                        </div>
                    </>
                </div>
            </div>
        </context.Provider>
    )
}

export default Background;