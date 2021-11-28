package com.craftmend.openaudiomc;

import com.craftmend.openaudiomc.api.impl.event.ApiEventDriver;

import com.craftmend.openaudiomc.generic.authentication.AuthenticationService;
import com.craftmend.openaudiomc.generic.cdn.CdnService;
import com.craftmend.openaudiomc.generic.commands.CommandService;
import com.craftmend.openaudiomc.generic.database.DatabaseService;
import com.craftmend.openaudiomc.generic.networking.rest.ServerEnvironment;
import com.craftmend.openaudiomc.generic.platform.interfaces.OpenAudioInvoker;
import com.craftmend.openaudiomc.generic.proxy.ProxyHostService;
import com.craftmend.openaudiomc.generic.proxy.interfaces.UserHooks;
import com.craftmend.openaudiomc.generic.service.Service;
import com.craftmend.openaudiomc.generic.service.ServiceManager;
import com.craftmend.openaudiomc.generic.storage.interfaces.Configuration;
import com.craftmend.openaudiomc.generic.logging.OpenAudioLogger;
import com.craftmend.openaudiomc.generic.media.MediaService;
import com.craftmend.openaudiomc.generic.media.time.TimeService;
import com.craftmend.openaudiomc.generic.migrations.MigrationWorker;
import com.craftmend.openaudiomc.generic.networking.interfaces.NetworkingService;
import com.craftmend.openaudiomc.generic.platform.Platform;
import com.craftmend.openaudiomc.generic.craftmend.CraftmendService;
import com.craftmend.openaudiomc.generic.redis.RedisService;
import com.craftmend.openaudiomc.generic.platform.interfaces.TaskService;
import com.craftmend.openaudiomc.generic.enviroment.GlobalConstantService;
import com.craftmend.openaudiomc.generic.state.StateService;
import com.craftmend.openaudiomc.generic.utils.data.GsonFactory;
import com.craftmend.openaudiomc.generic.voicechat.services.VoiceLicenseService;

import com.google.gson.Gson;
import lombok.Getter;

@Getter
public class OpenAudioMc {

    private final ServiceManager serviceManager = new ServiceManager();

    /**
     * Alright, so.
     * The main class is pretty empty, it doesn't do too much actually.
     * OpenAudioMc is divided into "services", with additional classes being loaded depending
     * on the runtime environment and available libraries (like spigot, bungee, velocity, worldguard, etc etc)
     *
     * The only thing this "main" class really does is collect some information about the operating
     * environment and initialize the "core" services one by one. These services are injected into others, or can
     * be requested through the instance getter.
     *
     * These are some core variables we need to keep track of, regardless of service
     */
    private final ApiEventDriver apiEventDriver = new ApiEventDriver();
    private final Configuration configuration;
    private final Platform platform;
    private final OpenAudioInvoker invoker;
    private final boolean cleanStartup;
    private boolean isDisabled = false;

    /**
     * Legacy and static instances (API, ENV, instance, build number and gson along with its type adapters)
     */
    public static ServerEnvironment SERVER_ENVIRONMENT = ServerEnvironment.PRODUCTION;
    @Getter private static OpenAudioMc instance;
    public static final OpenAudioMcBuild BUILD = new OpenAudioMcBuild();

    @Getter private static final Gson gson = GsonFactory.create();

    /**
     * Alright, lets get this show on the road.
     *
     * @param invoker Invoker environment description
     * @throws Exception Yes, when you dropped me, and I hit the floor, I caught the sads.
     *                   Which in turn, has made me sad.
     *                   These stacktraces you see, are my tears..
     *                   For I am sad...
     *                   I will never forgive you, for everything you've done.
     */
    public OpenAudioMc(OpenAudioInvoker invoker) throws Exception {
        // very first thing we need to do, is set the environment, since we might want to log extra data
        // on development servers, and disable debugging commands on production.
        String env = System.getenv("OA_ENVIRONMENT");
        if (env != null && !env.equals("")) {
            SERVER_ENVIRONMENT = ServerEnvironment.valueOf(env);
            OpenAudioLogger.toConsole("WARNING! STARTING IN " + env + " MODE!");
        }

        // random bullshit, go!
        instance = this;
        OpenAudioLogger.toConsole("Initializing build " + BUILD.getBuildNumber() + " by " + BUILD.getBuildAuthor());
        this.invoker = invoker;
        this.platform = invoker.getPlatform(); // constants
        this.cleanStartup = !this.invoker.hasPlayersOnline();
        this.configuration = invoker.getConfigurationProvider();

        // register providers
        // these are classes that might not be services (interfaces, or abstract) but
        // we want to use through dependency injection anyway
        serviceManager.registerDependency(Configuration.class, invoker.getConfigurationProvider());
        serviceManager.registerDependency(TaskService.class, invoker.getTaskProvider());
        serviceManager.registerDependency(UserHooks.class, invoker.getUserHooks());

        // migrate old config and data files between versions
        new MigrationWorker().handleMigrations();

        // load networking service, its a variable class (between platform) that we want to inject and
        // identify based on its abstract class name, meaning that injected code can be re-used regardless of platform
        serviceManager.registerDependency(NetworkingService.class, invoker.getServiceClass().getConstructor().newInstance());

        // load core services in order
        serviceManager.loadServices(
                DatabaseService.class,          // player and profile storage
                ProxyHostService.class,         // register handlers for proxy events
                MediaService.class,             // processes outgoing URL's
                TimeService.class,              // processes remote or network timecodes and translates them for the client
                StateService.class,             // handles internal state tracking/monitoring
                AuthenticationService.class,    // handles server key sets with the OpenAudioMc backend infrastructure
                GlobalConstantService.class,    // keeps track of remote project constants (like release versions, etc)
                CommandService.class,           // standardized command processor regardless of platform
                RedisService.class,             // redis hook/service implementation
                CraftmendService.class,         // craftmend specific features, like voice chat
                VoiceLicenseService.class,      // service to interact with the voice license request api
                CdnService.class
        );
    }

    public void postBoot() {
        getService(CraftmendService.class).postBoot();
    }

    // simple shutdown logic
    public void disable() {
        isDisabled = true;
        configuration.saveAll();

        serviceManager.getService(DatabaseService.class).shutdown();

        try {
            serviceManager.getService(CraftmendService.class).shutdown();
            serviceManager.getService(RedisService.class).shutdown();
            if (serviceManager.getService(StateService.class).getCurrentState().isConnected()) {
                serviceManager.getService(NetworkingService.class).stop();
            }
        } catch (NoClassDefFoundError exception) {
            OpenAudioLogger.toConsole("Bukkit already unloaded the OA+ classes, can't kill tokens.");
        }
    }

    // easy shorthand getters
    public static <T extends Service> T getService(Class<T> service) {
        return service.cast(OpenAudioMc.getInstance().getServiceManager().loadService(service));
    }

    public static <T> T resolveDependency(Class<T> d) {
        return d.cast(OpenAudioMc.getInstance().getServiceManager().resolve(d));
    }
}
