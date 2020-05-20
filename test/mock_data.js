const data = {
  foobar: {
    'users/show': {
      id: 1,
      name: 'User Foobar',
      screen_name: 'userFoobar',
      description: 'Minha descrição. Siga-me.',
      created_at: 'Thu May 03 21:22:44 +0000 2018',
      favourites_count: 1914,
      statuses_count: 5,
      profile_image_url: 'http://pbs.twimg.com/profile_images/123/Sh3_-jTK_normal.jpg',
      verified: false,
    },
    'followers/list': {
      users: [
        {
          id: 11,
          name: 'Follower One',
          screen_name: 'FollowerOne',
          description: 'A descrição',
          followers_count: 2750,
          friends_count: 2323,
          created_at: 'Sat Aug 22 10:10:45 +0000 2009',
          utc_offset: null,
          statuses_count: 10741,
        },
        {
          id: 12,
          name: 'Follower Two',
          screen_name: 'FollowerTwo',
          description: 'A descrição',
          followers_count: 781,
          friends_count: 965,
          created_at: 'Sat Aug 22 10:10:45 +0000 2009',
          utc_offset: null,
          statuses_count: 2384,
        },
        {
          id: 13,
          name: 'Follower Three',
          screen_name: 'FollowerThree',
          description: 'A descrição',
          followers_count: 56,
          friends_count: 44,
          created_at: 'Sat Aug 22 10:10:45 +0000 2009',
          utc_offset: null,
          statuses_count: 99,
        },
      ],
    },
    'friends/list': {
      users: [
        {
          id: 21,
          name: 'Friend One',
          screen_name: 'FriendOne',
          description: 'A descrição',
          followers_count: 487,
          friends_count: 568,
          created_at: 'Sat Aug 22 10:10:45 +0000 2009',
          utc_offset: null,
          statuses_count: 4565,
        },
        {
          id: 22,
          name: 'Friend Two',
          screen_name: 'FriendTwo',
          description: 'A descrição',
          followers_count: 852,
          friends_count: 554,
          created_at: 'Sat Aug 22 10:10:45 +0000 2009',
          utc_offset: null,
          statuses_count: 417,
        },
      ],
    },
    'statuses/user_timeline': [
      {
        created_at: 'Sat Nov 23 23:22:11 +0000 2019',
        text: '@FriendOne "O meu tweet"',
        truncated: false,
        entities: {
          hashtags: [{
            text: '@FriendOne',
          },
          ],
          symbols: [],
          user_mentions: [
            {
              screen_name: 'FriendOne',
              name: 'Friend One',
              id: 1,
              id_str: '1',
              indices: [],
            },
          ],
          urls: [],
        },
        in_reply_to_screen_name: 'FriendOne',
        user: {
          id: 1,
          id_str: '1',
          name: 'User Foobar',
          screen_name: 'userFoobar',
          description: 'Minha descrição. Siga-me.',
          created_at: 'Thu May 03 21:22:44 +0000 2018',
          statuses_count: 5,
        },
        lang: 'pt',
      },
    ],
  },
};


export default data;
