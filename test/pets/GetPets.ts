import { Task } from '@serenity-js/core';
import { GetRequest, Send } from '@serenity-js/rest';

export const GetPets = {
    from: (url: string) =>
        Task.where(`#actor consulta las mascotas en ${ url }`,
            Send.a(
                GetRequest.to(url).using({
                    headers: {
                        accept: 'application/json',
                    },
                }),
            ),
        ),
};
