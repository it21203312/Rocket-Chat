import React, { FC } from 'react';

import AttachmentProvider from '../components/message/Attachments/providers/AttachmentProvider';
import AuthorizationProvider from './AuthorizationProvider';
import AvatarUrlProvider from './AvatarUrlProvider';
import { CallProvider } from './CallProvider';
import ConnectionStatusProvider from './ConnectionStatusProvider';
import CustomSoundProvider from './CustomSoundProvider';
import LayoutProvider from './LayoutProvider';
import ModalProvider from './ModalProvider';
import OmnichannelProvider from './OmnichannelProvider';
import RouterProvider from './RouterProvider';
import ServerProvider from './ServerProvider';
import SessionProvider from './SessionProvider';
import SettingsProvider from './SettingsProvider';
import ToastMessagesProvider from './ToastMessagesProvider';
import TooltipProvider from './TooltipProvider';
import TranslationProvider from './TranslationProvider';
import UserProvider from './UserProvider';
import VideoConfProvider from './VideoConfProvider';

const MeteorProvider: FC = ({ children }) => (
	<ConnectionStatusProvider>
		<ServerProvider>
			<RouterProvider>
				<TranslationProvider>
					<SessionProvider>
						<TooltipProvider>
							<ToastMessagesProvider>
								<SettingsProvider>
									<LayoutProvider>
										<AvatarUrlProvider>
											<CustomSoundProvider>
												<UserProvider>
													<AuthorizationProvider>
														<CallProvider>
															<OmnichannelProvider>
																<VideoConfProvider>
																	<ModalProvider>
																		<AttachmentProvider>{children}</AttachmentProvider>
																	</ModalProvider>
																</VideoConfProvider>
															</OmnichannelProvider>
														</CallProvider>
													</AuthorizationProvider>
												</UserProvider>
											</CustomSoundProvider>
										</AvatarUrlProvider>
									</LayoutProvider>
								</SettingsProvider>
							</ToastMessagesProvider>
						</TooltipProvider>
					</SessionProvider>
				</TranslationProvider>
			</RouterProvider>
		</ServerProvider>
	</ConnectionStatusProvider>
);

export default MeteorProvider;
