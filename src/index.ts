import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  generateDependencyReport,
  joinVoiceChannel,
  PlayerSubscription,
} from "@discordjs/voice";
import {
  Client,
  Collection,
  CommandInteraction,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import dotenv from "dotenv";
import { Readable } from "stream";
import { getYoutubeAudioStream } from "./ytdl";

dotenv.config();

console.log(generateDependencyReport());

const { DISCORD_TOKEN, APP_ID } = process.env;

if (!DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is not defined in the environment variables.");
}
if (!APP_ID) {
  throw new Error("APP_ID is not defined in the environment variables.");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.login(DISCORD_TOKEN);

const chanelPlayerSubscriptions = new Collection<
  string,
  PlayerSubscription | undefined
>();

const commands = new Collection(
  [
    {
      data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
      execute: async (interaction: CommandInteraction) => {
        interaction.reply(`Pong ${new Date().toISOString()}!`);
      },
    },
    {
      data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song form YouTube")
        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription("The YouTube URL of the song to play")
            .setRequired(true)
        ),
      execute: async (interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;

        const url = interaction.options.getString("url");
        if (!url) {
          await interaction.reply({
            content: "You must provide a YouTube URL to play a song.",
            ephemeral: true,
          });
          return;
        }
        console.log(`Received play command with URL: ${url}`);

        const guild = client.guilds.cache.get(interaction.guildId!);
        const member = guild?.members.cache.get(interaction.user.id);
        const channel = member?.voice.channel;

        if (!channel) {
          await interaction.reply({
            content: "You need to be in a voice channel to play music!",
            ephemeral: true,
          });
          return;
        }

        const connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();

        const stream = await getYoutubeAudioStream(url);
        const resource = createAudioResource(Readable.from(stream));

        player.play(resource);

        const subscription = connection.subscribe(player);
        chanelPlayerSubscriptions.set(channel.id, subscription);

        player.addListener("stateChange", (oldState, newState) => {
          if (newState === AudioPlayerStatus.Idle) {
            console.log("Player is idle, stopping connection.");
            subscription?.connection.destroy();
          }
        });

        await interaction.reply({
          content: `Playing song from URL: ${url}`,
          ephemeral: true,
        });
      },
    },
    {
      data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop the currently playing song"),
      execute: async (interaction: CommandInteraction) => {
        const subscription = chanelPlayerSubscriptions.get(
          interaction.channelId
        );

        if (!subscription) {
          await interaction.reply({
            content: "No song is currently playing in this channel.",
            ephemeral: true,
          });
          return;
        }

        subscription.player.stop();
        subscription.connection.destroy();
        chanelPlayerSubscriptions.delete(interaction.channelId);
        await interaction.reply({
          content: "Stopped the currently playing song.",
          ephemeral: true,
        });
      },
    },
  ].map((item) => [item.data.name, item])
);

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  const command = commands.get(commandName);
  if (!command) {
    console.error(`No command matching ${commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

// update commands in Discord
const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.size} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(Routes.applicationCommands(APP_ID), {
      body: commands.map((command) => command.data.toJSON()),
    });

    console.log(`Successfully reloaded ${data} application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
