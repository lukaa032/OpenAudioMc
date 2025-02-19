import {Vector3} from "../../../../util/math/Vector3";
import {Speaker} from "../../../world/objects/Speaker";
import {WorldModule} from "../../../world/WorldModule";

export function handleSpeakerCreate(data) {
    // speaker in range
    const speaker = data.clientSpeaker;

    // Vector3 representing the center of the speaker
    const loc = new Vector3(
        speaker.location.x,
        speaker.location.y,
        speaker.location.z
    ).add(0.5, 0.5, 0.5);

    // create speaker
    const speakerData = new Speaker(
        speaker.id,
        speaker.source,
        loc,
        speaker.type,
        speaker.maxDistance,
        speaker.startInstant,
    );

    // add it to the render queue
    WorldModule.addSpeaker(speaker.id, speakerData);
}