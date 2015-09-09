<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xalan="http://xml.apache.org/xalan" xmlns:exist="http://exist.sourceforge.net/NS/exist" version="1.1">
    <xsl:output method="html" omit-xml-declaration="no" indent="yes" cdata-section-elements="l"/>
<!-- display for deletions the same regardless
of type: overstrike, overwrite, erasure, obscured -->
    <xsl:template match="sic">
        <xsl:choose>
            <xsl:when test="@corr">
                <xsl:apply-templates/>
            </xsl:when>
            <xsl:otherwise>
                <font>
                    <xsl:attribute name="color">red</xsl:attribute>
                    <font>
                        <xsl:attribute name="color">black</xsl:attribute>
                        <span style="text-decoration: line-through">
                            <xsl:apply-templates/>
                        </span>
                    </font>
                </font>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="choice">
        <xsl:if test="./sic">
            <xsl:value-of select="./sic/text()"/>
        </xsl:if>
        <xsl:if test="./orig">
            <xsl:apply-templates/>
        </xsl:if>
        <xsl:if test="./reg"/>
    </xsl:template>
    <xsl:template match="reg"/>
    <xsl:template match="corr"/>
    <xsl:template match="rep">
        <xsl:choose>
            <xsl:when test="@type='overwrite'">
                <font>
                    <xsl:attribute name="color">black</xsl:attribute>
                    <span style="background-color: #00CCFF;">
                        <xsl:apply-templates/>
                    </span>
                </font>
            </xsl:when>
            <xsl:otherwise>
                <font>
                    <xsl:attribute name="color">#00CCFF</xsl:attribute>
                    <xsl:apply-templates/>
                </font>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="del">
        <xsl:choose>
            <xsl:when test="( preceding::substSpan/@spanto = following::anchor/@xml:id ) or ( ./substSpan/@spanto = following::anchor/@xml:id ) or ( preceding::substSpan/@spanto = ./anchor/@xml:id )">
                <span style="background-color:#ffff99">
                    <xsl:choose>
                        <xsl:when test="@type='overwrite'">
                            <span style="text-decoration:line-through;">
                                <font>
                                    <xsl:attribute name="style">color:red;</xsl:attribute>
                                    <xsl:copy-of select="."/>
                                </font>
                            </span>
                        </xsl:when>
                        <xsl:when test="@type='erasure'">
                            <span style="text-decoration:line-through;background-color:lightgray">
                                <font>
                                    <xsl:attribute name="color">red</xsl:attribute>
                                    <xsl:apply-templates/>
                                </font>
                            </span>
                        </xsl:when>
                        <xsl:when test="@type='obscured'">
                            <span style="text-decoration:line-through;background-color:lightgray">
                                <font>
                                    <xsl:attribute name="color">red</xsl:attribute>
                                    <xsl:apply-templates/>
                                </font>
                            </span>
                        </xsl:when>
                        <xsl:when test="@type='overstrike'">
                            <span style="text-decoration:line-through;">
                                <font>
                                    <xsl:attribute name="color">black</xsl:attribute>
                                    <xsl:apply-templates/>
                                </font>
                            </span>
                        </xsl:when>
                        <xsl:otherwise>
                            <font>
                                <xsl:attribute name="color">red</xsl:attribute>
                                <font>
                                    <xsl:attribute name="color">black</xsl:attribute>
                                    <span style="text-decoration: line-through">
                                        <xsl:apply-templates/>
                                    </span>
                                </font>
                            </font>
                        </xsl:otherwise>
                    </xsl:choose>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <xsl:choose>
                    <xsl:when test="@type='overwrite'">
                        <span style="text-decoration:line-through;">
                            <font>
                                <xsl:attribute name="style">color:red;</xsl:attribute>
                                <xsl:apply-templates/>
                            </font>
                        </span>
                    </xsl:when>
                    <xsl:when test="@type='erasure'">
                        <span style="text-decoration:line-through;background-color:lightgray">
                            <font>
                                <xsl:attribute name="color">red</xsl:attribute>
                                <xsl:apply-templates/>
                            </font>
                        </span>
                    </xsl:when>
                    <xsl:when test="@type='wash'">
                        <span style="text-decoration:line-through;background-color:lightgrey;">
                            <font style="color:red;">
                                <xsl:apply-templates/>
                            </font>
                        </span>
                    </xsl:when>
                    <xsl:when test="@type='obscured'">
                        <span style="text-decoration:line-through;background-color:lightgray">
                            <font>
                                <xsl:attribute name="color">red</xsl:attribute>
                                <xsl:apply-templates/>
                            </font>
                        </span>
                    </xsl:when>
                    <xsl:when test="@type='overstrike'">
                        <span style="text-decoration:line-through;">
                            <font>
                                <xsl:attribute name="color">black</xsl:attribute>
                                <xsl:apply-templates/>
                            </font>
                        </span>
                    </xsl:when>
                    <xsl:otherwise>
                        <font>
                            <xsl:attribute name="color">red</xsl:attribute>
                            <font>
                                <xsl:attribute name="color">black</xsl:attribute>
                                <span style="text-decoration: line-through">
                                    <xsl:apply-templates/>
                                </span>
                            </font>
                        </font>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="anchorold">
        <xsl:variable name="extent">
            <xsl:value-of select="@xml:id"/>
        </xsl:variable>
        <xsl:variable name="parentType">
            <xsl:value-of select="local-name(//substSpan|delSpan|addSpan[@spanto = $extent])"/>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$parentType = 'substSpan'">
                <span style="background-color:#ffff99;">
                    <xsl:copy-of select="preceding-sibling::text( )[1]"/>
                </span>
            </xsl:when>
            <xsl:when test="$parentType = 'addSpan'">
                <font color="#00ccff">
                    <xsl:copy-of select="preceding-sibling::text( )[1]"/>
                </font>
            </xsl:when>
            <xsl:when test="$parentType = 'delSpan'">
                <span style="text-decoration:line-through;">
                    <xsl:copy-of select="preceding-sibling::text( )[1]"/>
                </span>
            </xsl:when>
            <xsl:otherwise>
		</xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="instr">
        <xsl:choose>
            <xsl:when test="@type='pencil'">
                <font>
                    <xsl:attribute name="color">gray</xsl:attribute>
                    <xsl:apply-templates/>
                </font>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="hr">
        <hr>
            <xsl:attribute name="align">
                <xsl:value-of select="@align"/>
            </xsl:attribute>
            <xsl:attribute name="style">border:1px solid #000000;color:#000000;background-color:#000000;height:1px;position:relative;left:<xsl:value-of select="@indent"/>em;width:<xsl:value-of select="@width"/>em;</xsl:attribute>
            <xsl:apply-templates/>
        </hr>
    </xsl:template>

<!-- display for additions -->
    <xsl:template match="unclear">
        <xsl:choose>
            <xsl:when test="@resp='hi'"/>
            <xsl:otherwise>
                <font>
                    <xsl:attribute name="color">gray</xsl:attribute>
                    <xsl:apply-templates/>
                </font>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="subst">
        <span style="background-color: #ffff99;">
            <xsl:apply-templates/>
        </span>
    </xsl:template>
    <xsl:template match="addSpan">
        <xsl:choose>
        <!-- inside substspan? -->
            <xsl:when test="( preceding::substSpan/@spanto = following::anchor/@xml:id ) or ( ./substSpan/@spanto = following::anchor/@xml:id ) or ( preceding::substSpan/@spanto = ./anchor/@xml:id )">
                <span style="background-color:#ffff99">
                    <font color="#00ccff">
                        <xsl:apply-templates/>
                    </font>
                </span>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="add">
        <xsl:choose>
	<!-- inside substspan? -->
            <xsl:when test="( preceding::substSpan/@spanto = following::anchor/@xml:id ) or ( ./substSpan/@spanto = following::anchor/@xml:id ) or ( preceding::substSpan/@spanto = ./anchor/@xml:id )">
                <span style="background-color:#ffff99">
                    <font color="#00ccff">
                        <xsl:if test="@type='overwrite'">
                            <font color="black">
                                <span style="background-color: green;"/>
                            </font>
                        </xsl:if>
                        <xsl:choose>
                            <xsl:when test="@place='inline'">
                                <xsl:apply-templates/>
                            </xsl:when>
<!--up arrow before and after-->
                            <xsl:when test="@place='supralinear'">
                                <xsl:apply-templates/>
                            </xsl:when>
<!--down arrow before and after-->
                            <xsl:when test="@place='infralinear'">
                                <xsl:apply-templates/>
                            </xsl:when>
                            <xsl:when test="@place='interlinear'">
                                <xsl:apply-templates/>
                            </xsl:when>
                            <xsl:when test="@place='over'">
                                <xsl:apply-templates/>
                            </xsl:when>
                            <xsl:when test="@place='margintop'">
                                <xsl:apply-templates/>
                            </xsl:when>
                            <xsl:when test="@place='marginbot'">
                                <xsl:apply-templates/>
                            </xsl:when>
                            <xsl:when test="@place='marginleft'">
                                <xsl:apply-templates/>
                            </xsl:when>
                            <xsl:when test="@place='marginright'">
                                <xsl:apply-templates/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:apply-templates/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </font>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <font color="#00ccff">
                    <xsl:if test="@type='overwrite'"/>
                    <xsl:choose>
                        <xsl:when test="@place='inline'">
                            <xsl:apply-templates/>
                        </xsl:when>
<!--up arrow before and after-->
                        <xsl:when test="@place='supralinear'">
                            <xsl:apply-templates/>
                        </xsl:when>
<!--down arrow before and after-->
                        <xsl:when test="@place='infralinear'">
                            <xsl:apply-templates/>
                        </xsl:when>
                        <xsl:when test="@place='interlinear'">
                            <xsl:apply-templates/>
                        </xsl:when>
                        <xsl:when test="@place='over'">
                            <xsl:apply-templates/>
                        </xsl:when>
                        <xsl:when test="@place='margintop'">
                            <xsl:apply-templates/>
                        </xsl:when>
                        <xsl:when test="@place='marginbot'">
                            <xsl:apply-templates/>
                        </xsl:when>
                        <xsl:when test="@place='marginleft'">
                            <xsl:apply-templates/>
                        </xsl:when>
                        <xsl:when test="@place='marginright'">
                            <xsl:apply-templates/>
                        </xsl:when>
                        <xsl:otherwise>
<!--           <xsl:apply-templates/>  -->
                        </xsl:otherwise>
                    </xsl:choose>
                </font>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>


<!-- display for gaps -->
    <xsl:template match="gap">
        <xsl:choose>
            <xsl:when test="@type='cancellation' or @reason='cancellation' or @type='overwrite' or @reason='overwrite' or @type='erasure' or @reason='erasure'">
                <xsl:choose>
                    <xsl:when test="@extent">
                        <span style="color:red;background-color:black;color:red;text-decoration:line-through;">
                            <xsl:call-template name="spacemaker">
                                <xsl:with-param name="spaces">
                                    <xsl:value-of select="round(@extent * 1.75)"/>
                                </xsl:with-param>
                            </xsl:call-template>
                        </span>
                    </xsl:when>
                    <xsl:otherwise>
                        <span style="color:red;background-color:black;color:red;text-decoration: line-through; ">
                            <xsl:call-template name="spacemaker">
                                <xsl:with-param name="spaces">
                                    <xsl:value-of select="round(10 * 1.75)"/>
                                </xsl:with-param>
                            </xsl:call-template>
                        </span>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:when test="@type='overwrzzle'">
                <xsl:choose>
                    <xsl:when test="@extent">
                        <span style="background-color:black;color:red;text-decoration: line-through">
                            <xsl:call-template name="spacemaker">
                                <xsl:with-param name="spaces">
                                    <xsl:value-of select="round(@extent * 1.75)"/>
                                </xsl:with-param>
                            </xsl:call-template>
                        </span>
                    </xsl:when>
                    <xsl:otherwise>
                        <span style="color:red;background-color:black;text-decoration: line-through">
                            <xsl:call-template name="spacemaker">
                                <xsl:with-param name="spaces">
                                    <xsl:value-of select="round(10 * 1.75)"/>
                                </xsl:with-param>
                            </xsl:call-template>
                        </span>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <xsl:choose>
                    <xsl:when test="@extent">
                        <span style="background-color:black;">
                            <xsl:call-template name="spacemaker">
                                <xsl:with-param name="spaces">
                                    <xsl:value-of select="round(@extent * 1.75)"/>
                                </xsl:with-param>
                            </xsl:call-template>
                        </span>
                    </xsl:when>
                    <xsl:otherwise>
                        <span style="background-color:black;">
                            <xsl:call-template name="spacemaker">
                                <xsl:with-param name="spaces">
                                    <xsl:value-of select="round(10 * 1.75)"/>
                                </xsl:with-param>
                            </xsl:call-template>
                        </span>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="hspace">
        <xsl:choose>
            <xsl:when test="@extent">
                <span style="background-color:yellow">
                    <xsl:call-template name="spacemaker">
                        <xsl:with-param name="spaces">
                            <xsl:value-of select="round(@extent * 1.75)"/>
                        </xsl:with-param>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <span style="background-color:yellow">
                    <xsl:call-template name="spacemaker">
                        <xsl:with-param name="spaces">
                            <xsl:value-of select="round(10 * 1.75)"/>
                        </xsl:with-param>
                    </xsl:call-template>
                </span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>