package net.openaudiomc.regions;

import com.sk89q.worldguard.bukkit.WorldGuardPlugin;
import com.sk89q.worldguard.protection.ApplicableRegionSet;
import com.sk89q.worldguard.protection.managers.RegionManager;
import com.sk89q.worldguard.protection.regions.ProtectedRegion;
import net.openaudiomc.actions.command;
import net.openaudiomc.minecraft.Main;
import org.bukkit.Bukkit;
import org.bukkit.Location;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.*;

import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * Created by mats on 16-5-2017.
 */
public class regionListener implements Listener{

    public Map<Player, Set<ProtectedRegion>> playerRegions = new HashMap();
    public static Main plugin;
    public static WorldGuardPlugin wgPlugin;

    public static void setup(Main oapl, WorldGuardPlugin wgpg) {
        wgPlugin = wgpg;
        plugin = oapl;
    }

    private void stop(Player p) {

    }

    private void start(final Player p, ApplicableRegionSet appRegions, Set<ProtectedRegion> regions) {
        for (final ProtectedRegion region : appRegions) {
            if (!regions.contains(region)) {
                Bukkit.getScheduler().runTaskLater(this.plugin, new Runnable() {
                    public void run() {
                        if (isValidRegion(region.getId())) {
                            command.playRegion(p.getName(), getRegionFile(region.getId()));
                        }
                    }
                }, 1L);
                regions.add(region);
            }
        }
    }

    private void end(Player p, ProtectedRegion region) {
        command.stopRegion(p.getName(), getRegionFile(region.getId()));
    }

    @EventHandler
    public void onPlayerKick(PlayerKickEvent e) {
        Set<ProtectedRegion> regions = playerRegions.remove(e.getPlayer());
        if (regions != null) {
            stop(e.getPlayer());
        }
    }

    @EventHandler
    public void onPlayerQuit(PlayerQuitEvent e) {
        Set<ProtectedRegion> regions = playerRegions.remove(e.getPlayer());
        if (regions != null) {
            stop(e.getPlayer());
        }
    }

    @EventHandler
    public void onPlayerMove(PlayerMoveEvent e) {
        e.setCancelled(updateRegions(e.getPlayer(), MovementWay.MOVE, e.getTo(), e));
    }

    @EventHandler
    public void onPlayerTeleport(PlayerTeleportEvent e) {
        e.setCancelled(updateRegions(e.getPlayer(), MovementWay.TELEPORT, e.getTo(), e));
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent e) {
        updateRegions(e.getPlayer(), MovementWay.SPAWN, e.getPlayer().getLocation(), e);
    }

    @EventHandler
    public void onPlayerRespawn(PlayerRespawnEvent e) {
        updateRegions(e.getPlayer(), MovementWay.SPAWN, e.getRespawnLocation(), e);
    }


    //from wgregionevents, original by mewin.
    private synchronized boolean updateRegions(final Player player, final MovementWay movement, Location to, final PlayerEvent event) {
        Set<ProtectedRegion> regions;
        if (this.playerRegions.get(player) == null) {
            regions = new HashSet();
        } else {
            regions = new HashSet((Collection)this.playerRegions.get(player));
        }
        Set<ProtectedRegion> oldRegions = new HashSet(regions);

        RegionManager rm = this.wgPlugin.getRegionManager(to.getWorld());
        if (rm == null) {
            return false;
        }
        ApplicableRegionSet appRegions = rm.getApplicableRegions(to);

        //for ding
        start(player, appRegions, regions);

        Collection<ProtectedRegion> app = appRegions.getRegions();
        Object itr = regions.iterator();
        while (((Iterator)itr).hasNext()) {
            final ProtectedRegion region = (ProtectedRegion)((Iterator)itr).next();
            if (!app.contains(region)) {
                if (rm.getRegion(region.getId()) != region) {
                    ((Iterator)itr).remove();
                } else {

                    Bukkit.getScheduler().runTaskLater(this.plugin, new Runnable()
                    {
                        public void run()
                        {
                            end(player, region);
                        }
                    }, 1L);
                    ((Iterator)itr).remove();
                }
            }
        }
        this.playerRegions.put(player, regions);
        return false;
    }

    //returns file of a region
    public static String getRegionFile(String regionName) {
        if (isValidRegion(regionName) == true) {
            return file.getString("region.src." + regionName);
        } else {
            return "InvalidSource";
        }
    }


    public static String getRegionWorld(String regionName) {
        if (file.getString("world." + regionName) !=null && file.getString("region.isvalid." + regionName).equals("true")) {
            return file.getString("world." + regionName);
        } else {
            return "<none>";
        }
    }

    //check if a region ia know to openaudio (true = valid)
    public static Boolean isValidRegion(String regionName) {
        if (file.getString("region.isvalid." + regionName) !=null && file.getString("region.isvalid." + regionName).equals("true")) {
            return true;
        } else {
            return false;
        }
    }

    public static void registerRegion(String regionName, String src, Player p) {
        FileConfiguration cfg = YamlConfiguration.loadConfiguration(new File("plugins/OpenAudio", "regions.yml"));
        File regionsFile = new File("plugins/OpenAudio", "regions.yml");
        cfg.set("region.isvalid."+regionName, "true");
        cfg.set("region.src."+regionName, src);
        cfg.set("world."+regionName, p.getLocation().getWorld().getName());
        try {
            cfg.save(regionsFile);
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }


    public static void deleteRegion(String regionName) {
        FileConfiguration cfg = YamlConfiguration.loadConfiguration(new File("plugins/OpenAudio", "regions.yml"));
        File regionsFile = new File("plugins/OpenAudio", "regions.yml");
        cfg.set("region.isvalid."+regionName, "false");
        cfg.set("region.src."+regionName, "<deleted>");
        try {
            cfg.save(regionsFile);
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

}
