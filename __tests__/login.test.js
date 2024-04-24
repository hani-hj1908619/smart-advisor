import { createMocks } from 'node-mocks-http';
import { handler } from '../pages/api/user/';
import {withSessionRoute} from "../utils/withSession";
import mockSessionMiddleware from "../utils/mockSessionMiddleware";
import {withIronSessionApiRoute} from "iron-session/next";
import {mockJwtToken, mockVerifyJwt} from "../utils/mocks/loginMock";
import {verifyToken} from "../pages/api/util/verifyToken";
// Import the handler function you want to test

describe('API Handler', () => {
    test('POST method should return success response', async () => {
        const user = {
            id: '1',
            password: '1',
            gender: 'M',
            name: 'Hani Jafer'
        }
        const { req, res } = createMocks ({
            method: 'POST',
            body: user,
            headers: {'Content-Type': 'application/json'}
        });


        // with session wrapper
        const handlerWithSession = withSessionRoute(handler)
        //Api endpoint
        await handlerWithSession(req, res);
        const responseData = res._getJSONData()

        expect(res._getStatusCode()).toBe(200);
        expect(responseData).toHaveProperty('name', 'userToken', 'college', 'major')
        expect(mockVerifyJwt(responseData.userToken)).toBe(parseInt(user.id))
    });

    test('DELETE method should return success response', async () => {
        const { req, res } = createMocks({
            method: 'DELETE',
            headers: {
                authorization: 'Bearer token',
            },
        });

        // with session wrapper
        const handlerWithSession = withSessionRoute(handler)
        //Api endpoint
        await handlerWithSession(req, res);

        await handler(req, res);
        console.log('ea')
        expect(res._getStatusCode()).toBe(200);
        expect(res._getJSONData()).toEqual({
            ok: true,
        });
    });
});
