import { PublicKey } from "@solana/web3.js";

const TOKEN_METADATA_PROGRAM = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

/**
 * convert slot number to actual time
 * @param slotNumber chain slot number
 * @param genesisTime default use mainnet genesis time
 * @returns 
 */
export function slotToTime(slotNumber: number, genesisTime: number): number {
    const slotDuration = 400; // Slot duration in milliseconds
    // const genesisTime = 1596059090000; // Example genesis time in milliseconds (Unix timestamp)
    return genesisTime + (slotNumber * slotDuration);
}

function u64toBuffer(n: number) {
    const res = Buffer.alloc(8);
    res.writeBigUInt64LE(BigInt(n));
    return res
}

export function deriveProjectAccount(programId: string, mint: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from('Project'), mint.toBuffer()], new PublicKey(programId))[0]
  }
export function deriveProposalAccount(programId: string, project: string, index: number): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from('Party'), new PublicKey(project).toBuffer(), u64toBuffer(index)], new PublicKey(programId))[0]
}

export function deriveMetadataAccount(mint: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from('metadata'), TOKEN_METADATA_PROGRAM.toBuffer(), mint.toBuffer()],
        TOKEN_METADATA_PROGRAM
    )[0];
}

// 把时间戳转换为 yyyy-mm-dd hh:mm:ss 格式
export function formatTime(time: number): string {
    const date = new Date(time);
    let month: string|number = date.getMonth() + 1;
    if (month < 10) {
        month = `0${month}`;
    }
    let day: string|number = date.getDate();
    if (day < 10) {
        day = `0${day}`;
    }
    let hour: string | number = date.getHours();
    if (hour < 10) {
        hour = `0${hour}`;
    }
    let minute: string | number = date.getMinutes();
    if (minute < 10) {
        minute = `0${minute}`;
    }
    let second: string | number = date.getSeconds();
    if (second < 10) {
        second = `0${second}`;
    }

    return `${date.getFullYear()}-${month}-${day} ${hour}:${minute}:${second}`
}