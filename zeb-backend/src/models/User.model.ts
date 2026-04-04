import mongoose, {Schema, Document} from "mongoose";

export interface IUser extends Document {
  username: string;
  passwordHash?: string; 
  publickey: string;
  createdAt: Date;
}

const userSchema: Schema<IUser> = new Schema<IUser>({
  username: { type: String, required: true, unique: true, minLength: 3, maxLength: 256},
  passwordHash: { type: String, required: false },
  publickey:  { type: String, required: true, unique: true},
  createdAt: {type: Date, default: Date.now}
});


export default mongoose.model<IUser>("User", userSchema);


