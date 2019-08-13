package com.craftmend.openaudiomc.generic.scheduling;

import com.craftmend.openaudiomc.OpenAudioMc;
import com.craftmend.openaudiomc.bungee.OpenAudioMcBungee;
import com.craftmend.openaudiomc.generic.platform.Platform;
import com.craftmend.openaudiomc.spigot.OpenAudioMcSpigot;
import net.md_5.bungee.api.plugin.Plugin;
import org.bukkit.Bukkit;

import java.util.concurrent.TimeUnit;

public class AsyncRepeatingTask {

    private int delay;
    private Runnable executable;

    public AsyncRepeatingTask(int delay) {
        this.delay = delay;
    }

    public AsyncRepeatingTask setTask(Runnable runnable) {
        this.executable = runnable;
        return this;
    }

    public void start() {
        // handle based on platform
        if (OpenAudioMc.getInstance().getPlatform() == Platform.SPIGOT) {
            Bukkit.getScheduler().scheduleAsyncRepeatingTask(OpenAudioMcSpigot.getInstance(), executable, delay, delay);
        } else {
            Plugin bungee = OpenAudioMcBungee.getInstance();
            bungee.getProxy().getScheduler().schedule(bungee, executable, (delay / 20), (delay / 20), TimeUnit.SECONDS);
        }
    }

}
