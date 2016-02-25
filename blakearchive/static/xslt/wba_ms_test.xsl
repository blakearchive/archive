<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exist="http://exist.sourceforge.net/NS/exist"
                version="1.1">
    <xsl:output method="html" omit-xml-declaration="no" indent="yes" cdata-section-elements="l"/>
    <!-- display for deletions the same regardless
    of type: overstrike, overwrite, erasure, obscured -->
    <xsl:template match="sic">
        <xsl:choose>
            <xsl:when test="@corr">
                <xsl:apply-templates/>
            </xsl:when>
            <xsl:otherwise>
                <span class="tei-sic"> <!-- style="color: black; text-decoration: line-through" -->
                    <xsl:apply-templates/>
                </span>
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
                <span class="tei-rep-overwrite"> <!-- style="color: black; background-color: #00CCFF;" -->
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <span class="tei-rep"> <!-- style="background-color: #00CCFF;" -->
                    <xsl:apply-templates/>
                </span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="del">
        <xsl:choose>
            <xsl:when
                    test="( preceding::substSpan/@spanto = following::anchor/@xml:id ) or ( ./substSpan/@spanto = following::anchor/@xml:id ) or ( preceding::substSpan/@spanto = ./anchor/@xml:id )">
                <span style="background-color:#ffff99">
                    <xsl:choose>
                        <xsl:when test="@type='overwrite'">
                            <span class="tei-del-overwrite"> <!--  style="color: red; text-decoration:line-through;" -->
                                <xsl:copy-of select="."/>
                            </span>
                        </xsl:when>
                        <xsl:when test="@type='erasure'">
                            <span class="tei-del-erasure"> <!-- style="color: red; text-decoration:line-through;background-color:lightgray" -->
                                <font>
                                    <xsl:attribute name="color">red</xsl:attribute>
                                    <xsl:apply-templates/>
                                </font>
                            </span>
                        </xsl:when>
                        <xsl:when test="@type='obscured'">
                            <span class="tei-del-obscured"> <!-- style="text-decoration:line-through;background-color:lightgray" -->
                                <xsl:apply-templates/>
                            </span>
                        </xsl:when>
                        <xsl:when test="@type='overstrike'">
                            <span class="tei-del-overstrike"> <!-- style="color: black; text-decoration:line-through;" -->
                                <xsl:apply-templates/>
                            </span>
                        </xsl:when>
                        <xsl:otherwise>
                            <span class="tei-del"> <!-- style="color: black; text-decoration: line-through" -->
                                <xsl:apply-templates/>
                            </span>
                        </xsl:otherwise>
                    </xsl:choose>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <xsl:choose>
                    <xsl:when test="@type='overwrite'">
                        <span class="tei-del-overwrite">
                            <xsl:apply-templates/>
                        </span>
                    </xsl:when>
                    <xsl:when test="@type='erasure'">
                        <span class="tei-del-erasure">
                            <xsl:apply-templates/>
                        </span>
                    </xsl:when>
                    <xsl:when test="@type='wash'">
                        <span class="tei-del-wash"> <!-- style="color: red; text-decoration:line-through;background-color:lightgrey;" -->
                            <xsl:apply-templates/>
                        </span>
                    </xsl:when>
                    <xsl:when test="@type='obscured'">
                        <span class="tei-del-obscured">
                            <xsl:apply-templates/>
                        </span>
                    </xsl:when>
                    <xsl:when test="@type='overstrike'">
                        <span class="tei-del-overstrike">
                            <xsl:apply-templates/>
                        </span>
                    </xsl:when>
                    <xsl:otherwise>
                        <span class="tei-del">
                            <xsl:apply-templates/>
                        </span>
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
                <span class="tei-anchorold-subsetspan"> <!-- style="background-color:#ffff99;" -->
                    <xsl:copy-of select="preceding-sibling::text( )[1]"/>
                </span>
            </xsl:when>
            <xsl:when test="$parentType = 'addSpan'">
                <span class="tei-anchorold-addspan"> <!-- color="#00ccff" -->
                    <xsl:copy-of select="preceding-sibling::text( )[1]"/>
                </span>
            </xsl:when>
            <xsl:when test="$parentType = 'delSpan'">
                <span class="tei-anchorold-delspan"> <!-- style="text-decoration:line-through;" -->
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
                <span class="tei-instr-pencil"> <!-- color: gray -->
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="hr">
        <hr class="tei-hr"> <!--  -->
            <xsl:attribute name="align">
                <xsl:value-of select="@align"/>
            </xsl:attribute>
            <xsl:attribute name="style">left:<xsl:value-of select="@indent"/>em;width:<xsl:value-of select="@width"/>em;
            </xsl:attribute>
            <xsl:apply-templates/>
        </hr>
    </xsl:template>

    <!-- display for additions -->
    <xsl:template match="unclear">
        <xsl:choose>
            <xsl:when test="@resp='hi'"/>
            <xsl:otherwise>
                <span class="tei-unclear-hi"> <!-- color: gray -->
                    <xsl:apply-templates/>
                </span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="subst">
        <span class="tei-subst"> <!-- style="background-color: #ffff99;" -->
            <xsl:apply-templates/>
        </span>
    </xsl:template>
    <xsl:template match="addSpan">
        <xsl:choose>
            <!-- inside substspan? -->
            <xsl:when
                    test="( preceding::substSpan/@spanto = following::anchor/@xml:id ) or ( ./substSpan/@spanto = following::anchor/@xml:id ) or ( preceding::substSpan/@spanto = ./anchor/@xml:id )">
                <span class="tei-addspan-substspan"> <!-- style="color: #00ccff; background-color:#ffff99" -->
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="add">
        <xsl:choose>
            <!-- inside substspan? -->
            <xsl:when
                    test="( preceding::substSpan/@spanto = following::anchor/@xml:id ) or ( ./substSpan/@spanto = following::anchor/@xml:id ) or ( preceding::substSpan/@spanto = ./anchor/@xml:id )">
                <span class="tei-add-substspan"> <!-- style="color: #00ccff; background-color:#ffff99" -->
                    <xsl:if test="@type='overwrite'">
                        <!--<font color="black">-->
                        <!--<span style="background-color: green;"/>-->
                        <!--</font>-->
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
                </span>
            </xsl:when>
            <xsl:otherwise>
                <span class="tei-add"> <!-- color="#00ccff" -->
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
                </span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>


    <!-- display for gaps -->
    <xsl:template match="gap">
        <xsl:choose>
            <xsl:when
                    test="@type='cancellation' or @reason='cancellation' or @type='overwrite' or @reason='overwrite' or @type='erasure' or @reason='erasure'">
                <xsl:choose>
                    <xsl:when test="@extent">
                        <span class="tei-gap-cancellation"> <!-- style="color:red;background-color:black;text-decoration:line-through;" -->
                            <xsl:call-template name="spacemaker">
                                <xsl:with-param name="spaces">
                                    <xsl:value-of select="round(@extent * 1.75)"/>
                                </xsl:with-param>
                            </xsl:call-template>
                        </span>
                    </xsl:when>
                    <xsl:otherwise>
                        <span class="tei-gap-cancellation">
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
                        <span class="tei-gap-cancellation">
                            <xsl:call-template name="spacemaker">
                                <xsl:with-param name="spaces">
                                    <xsl:value-of select="round(@extent * 1.75)"/>
                                </xsl:with-param>
                            </xsl:call-template>
                        </span>
                    </xsl:when>
                    <xsl:otherwise>
                        <span class="tei-gap-cancellation">
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
                        <span class="tei-gap"> <!-- style="background-color:black;" -->
                            <xsl:call-template name="spacemaker">
                                <xsl:with-param name="spaces">
                                    <xsl:value-of select="round(@extent * 1.75)"/>
                                </xsl:with-param>
                            </xsl:call-template>
                        </span>
                    </xsl:when>
                    <xsl:otherwise>
                        <span class="tei-gap">
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
                <span class="tei-hspace"> <!-- style="background-color:yellow" -->
                    <xsl:call-template name="spacemaker">
                        <xsl:with-param name="spaces">
                            <xsl:value-of select="round(@extent * 1.75)"/>
                        </xsl:with-param>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <span class="tei-hspace">
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