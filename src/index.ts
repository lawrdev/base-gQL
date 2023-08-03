import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const db = {
  games: [
    { id: "1", title: "Zelda, Tears of the Kingdom", platform: ["Switch"] },
    { id: "2", title: "Final Fantasy 7 Remake", platform: ["PS5", "Xbox"] },
    { id: "3", title: "Elden Ring", platform: ["PS5", "Xbox", "PC"] },
    { id: "4", title: "Mario Kart", platform: ["Switch"] },
    { id: "5", title: "Pokemon Scarlet", platform: ["PS5", "Xbox", "PC"] },
  ],
  authors: [
    { id: "1", name: "mario", verified: true },
    { id: "2", name: "yoshi", verified: false },
    { id: "3", name: "peach", verified: true },
  ],
  reviews: [
    {
      id: "1",
      rating: 9,
      content: "lorem ipsum",
      author_id: "1",
      game_id: "2",
    },
    {
      id: "2",
      rating: 10,
      content: "lorem ipsum",
      author_id: "2",
      game_id: "1",
    },
    {
      id: "3",
      rating: 7,
      content: "lorem ipsum",
      author_id: "3",
      game_id: "3",
    },
    {
      id: "4",
      rating: 5,
      content: "lorem ipsum",
      author_id: "2",
      game_id: "4",
    },
    {
      id: "5",
      rating: 8,
      content: "lorem ipsum",
      author_id: "2",
      game_id: "5",
    },
    {
      id: "6",
      rating: 7,
      content: "lorem ipsum",
      author_id: "1",
      game_id: "2",
    },
    {
      id: "7",
      rating: 10,
      content: "lorem ipsum",
      author_id: "3",
      game_id: "1",
    },
  ],
};

const typeDefs = `#graphql
    type Game {
        id: ID!
        title: String!
        platform: [String!]!
        reviews: [Review!] 
    }

    type Review {
        id: ID!
        rating: Int!
        content: String!
        game: Game!
        author: Author! 
    }

    type Author {
        id: ID!
        name: String!
        verified: Boolean!
        reviews: [Review!] 
    }

    type Query {
        reviews: [Review]
        review(id: ID!): Review
        games: [Game]
        game(id: ID!): Game
        authors: [Author]
        author(id: ID!): Author
    }

    type Mutation {
      deleteGame(id: ID!): [Game],
      addGame(game: AddGameInput!): Game,
      updateGame(id: ID!, edits: EditGameInput!): Game
    }

    input AddGameInput {
      title: String!,
      platform: [String!]!
    }
    input EditGameInput {
      title: String,
      platform: [String!]
    }
`;

const resolvers = {
  Query: {
    games() {
      return db.games;
    },
    game(_, args) {
      return db.games.find((g) => g.id === args.id);
    },
    reviews() {
      return db.reviews;
    },
    review(_, args) {
      return db.reviews.find((r) => r.id === args.id);
    },
    authors() {
      return db.authors;
    },
    author(_, args) {
      return db.authors.find((a) => a.id === args.id);
    },
  },

  Game: {
    reviews(parent) {
      return db.reviews.filter((r) => r.game_id === parent.id);
    },
  },
  Author: {
    reviews(parent) {
      return db.reviews.filter((a) => a.author_id === parent.id);
    },
  },
  Review: {
    author(parent) {
      return db.authors.find((a) => a.id === parent.author_id);
    },
    game(parent) {
      return db.games.find((g) => g.id === parent.game_id);
    },
  },

  Mutation: {
    deleteGame(_, args) {
      db.games = db.games.filter((g) => g.id !== args.id);
      return db.games;
    },

    addGame(_, args) {
      let newGame = {
        ...args.game,
        id: Math.floor(Math.random() * 10000).toString(),
      };

      db.games.push(newGame);

      return newGame;
    },

    updateGame(_, args) {
      db.games = db.games.map((g) => {
        if (g.id === args.id) {
          return { ...g, ...args.edits };
        }

        return g;
      });

      return db.games.find((x) => x.id === args.id);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log("server ready at port", url);
