import { Request, Response } from 'express';

import roomInfoModel from '../models/roomInfoModel';
import roomCodeUtil from '../utils/roomCode';
import StatusCode from '../@types/statusCode';
import roomService from '../services/roomService';
import validationUtil from '../utils/validation';
import socketService from '../sockets/socketService';
import { CreatedRoomType } from '../@types/dataType';

const getPublicRoomList = async (req: Request, res: Response) => {
  try {
    const roomCodeList = await roomInfoModel.getRoomCodeList();
    const roomLists = await roomService.getRoomInfoList(roomCodeList);
    const filteredRoomLists = roomLists.filter((room) => room.isPrivate === 'false');

    return res.status(StatusCode.OK).json({ roomList: filteredRoomLists });
  } catch (err) {
    return res.status(StatusCode.SERVER_ERROR).json();
  }
};

const createRoom = async (req: Request, res: Response) => {
  const { title, isPrivate } = req.body;
  if (!(validationUtil.isTitleValid(title) && validationUtil.isIsPrivateValid(isPrivate)))
    return res.status(StatusCode.CLIENT_ERROR).json();

  try {
    const roomCode = await roomCodeUtil.getRandomCode();
    await roomInfoModel.setRoom(roomCode, title, isPrivate);
    const createdRoom: CreatedRoomType = { roomCode, title, isPrivate };
    return res.status(StatusCode.OK).json(createdRoom);
  } catch (err) {
    return res.status(StatusCode.SERVER_ERROR).json();
  }
};

const getParticipantsList = async (req: Request, res: Response) => {
  const roomCode = req.params.roomCode;
  if (!validationUtil.isRoomCodeValid(roomCode)) return res.status(StatusCode.CLIENT_ERROR).json();
  try {
    const participantsList = await socketService.getParticipantsListFromRoomCode(roomCode);
    return res.status(StatusCode.OK).json({ participantsList });
  } catch (err) {
    return res.status(StatusCode.SERVER_ERROR).json();
  }
};

const roomController = {
  getPublicRoomList,
  createRoom,
  getParticipantsList,
};

export default roomController;