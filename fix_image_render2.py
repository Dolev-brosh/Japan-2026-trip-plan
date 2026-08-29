import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add to Ticket Content
# It ends like this:
'''
                          ))}
                        </div>
                      )}
                    </div>
                  )}
'''

code = code.replace(
'''                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reminder Content */}''',
'''                          ))}
                        </div>
                      )}
                      {day.imageUrl && (
                        <div className="mt-4" onClick={e => e.stopPropagation()}>
                          <Zoom>
                            <img src={day.imageUrl} alt="Attachment" className="w-full h-auto object-cover rounded-lg border border-black/10" />
                          </Zoom>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reminder Content */}'''
)


# Reminder Content ends like this:
'''
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
'''

code = code.replace(
'''                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>''',
'''                          ))}
                        </div>
                      )}
                      {day.imageUrl && (
                        <div className="mt-4" onClick={e => e.stopPropagation()}>
                          <Zoom>
                            <img src={day.imageUrl} alt="Attachment" className="w-full h-auto object-cover rounded-lg border border-black/10" />
                          </Zoom>
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>'''
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

